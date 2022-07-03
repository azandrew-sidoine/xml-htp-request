import { Cloneable } from './clone';
import { FormDataRequestEncoder, RawEncoder } from './encoders';
import { usePipeline } from './interceptors';
import {
  Interceptor,
  NextFunction,
  RequestInterface,
  RequestType,
} from './types';
import { URIHelper } from './url';
import { arrayIncludes, toBinary, isValidHttpUrl, getHost } from './utils';

const HTTP_HEADERS = [
  'A-IM',
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Datetime',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Length',
  'Content-Type',
  'Cookie',
  'Date',
  'Expect',
  'Forwarded',
  'From',
  'Host',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authorization',
  'Range',
  'Referer',
  'TE',
  'User-Agent',
  'Upgrade',
  'Via',
  'Warning',
];

/**
 * Creates an XML Http Request object from the Request object
 */
export function useXMLHttpRequest(request: RequestInterface) {
  const xhr = new XMLHttpRequest();

  // TODO: open the request
  xhr.open(request.method, request.url, true);

  if (request!.options!.responseType) {
    xhr.responseType = request!.options.responseType;
  }

  if (request.options!.withCredentials) {
    xhr.withCredentials = !!request.options!.withCredentials;
  }
  // TODO: If request timeout
  if (request.options!.timeout) {
    xhr.timeout = request.options!.timeout;
  }

  // TODO: Subscribe to timeout event
  if (request.options!.onTimeout) {
    xhr.addEventListener(
      'timeout',
      (event: ProgressEvent<XMLHttpRequestEventTarget>) =>
        request.options!.onTimeout(event)
    );
  }

  // TODO : Subscribe to progess event
  if (request.options!.onProgress) {
    const progress = xhr.upload ? xhr.upload : xhr;
    progress.addEventListener(
      'progress',
      (event: ProgressEvent<XMLHttpRequestEventTarget>) =>
        request.options.onProgress(event)
    );
  }

  // Default headers to use when client does not provide a headers options
  const defaultHeaders = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Merge headers
  const headers = request.options!.headers
    ? { ...defaultHeaders, ...request.options.headers }
    : defaultHeaders;

  // TODO : Use the default headers constant
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
  return xhr;
}

// Get all request headers
function getResponseHeaders(headers: string) {
  return headers.split('\r\n').reduce((result, current) => {
    let [name, value] = current.split(': ');
    result[name] = value;
    return result;
  }, {});
}

// Send the request using the provided client object
async function sendRequest(
  instance: XMLHttpRequest,
  request: RequestInterface
) {
  const headers = request.options?.headers || {};
  if (typeof request.body === 'undefined' || request.body === null) {
    console.log('Sending GET request');
    return instance.send();
  }

  if (request.body instanceof FormData) {
    console.log('Sending Multipart request');
    return instance.send(request.body);
  }

  if (headers['Content-type'].indexOf('application/json') !== -1) {
    console.log('Sending request', JSON.stringify(request.body));
    return instance.send(JSON.stringify(request.body));
  }

  if (headers['Content-type'].indexOf('multipart/form-data') !== -1) {
    console.log('Sending binary request');
    const encoder = new FormDataRequestEncoder();
    instance.setRequestHeader(
      'Content-Type',
      'multipart/form-data; boundary=' + encoder.getBoundary()
    );
    return instance.send(toBinary(await encoder.encode(request.body)));
  }
  const encoder = new RawEncoder(headers['Content-type'] || 'text/plain');
  return instance.send(encoder.encode(request.body) as string);
}

/**
 * @description Creates a clonable request object that adds a clone method to object provided
 * by the as parameter allowing middleware to clone request
 * using ```js request = request.clone({}); ``` calls.
 */
export function Request(request: RequestType) {
  return Cloneable(Object, { ...request }) as RequestInterface;
}

/**
 * @description Creates a client object for making request
 */
export function useClient(host: string = undefined) {
  const client = new Object();
  Object.defineProperty(client, 'request', {
    value: (request: RequestInterface) => {
      // TODO : Create the request pipeline and call it on the request function
      const interceptors =
        request.options?.interceptors ||
        ([] as Interceptor<RequestInterface>[]);

      // Push an interceptor that apply url search parameters if the request is a get
      // request
      interceptors.push(
        (request: RequestInterface, next: NextFunction<RequestInterface>) => {
          const url = !isValidHttpUrl(request.url)
            ? `${getHost(host ?? '')}/${request.url}`
            : request.url;
          if (
            arrayIncludes(
              ['post', 'path', 'options'],
              request.method?.toLocaleLowerCase() ?? ''
            ) &&
            request.body
          ) {
            request = request.clone({
              url: URIHelper.buildSearchParams(url, request.body),
            });
          }
          const response = next(request);
          return response;
        }
      );

      // Call the request pipeline function and invoke the actual request client instance send method
      return usePipeline(...interceptors)(request, (message) => {
        // TODO : Create xml request object
        const instance = useXMLHttpRequest(message);
        // If the request body is an instance of FormData object,
        // we simply pass it to the send method for POST request
        sendRequest(instance, message);
        // TODO: Register to the load event
        return new Promise((resolve, reject) => {
          instance.addEventListener(
            'load',
            (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
              resolve(event);
              // Resolve promise
              console.log(event);
            }
          );

          // TODO : Subscribe to error event
          if (request.options!.onError) {
            instance.addEventListener(
              'error',
              (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
                if (typeof request.options?.onError === 'function') {
                  request.options!.onError(event);
                }
                reject(event);
                console.log(event);
              }
            );
          }
        });
      });
    },
  });

  return client as Object & {
    request: (message: RequestInterface) => Promise<Response>;
  };
}

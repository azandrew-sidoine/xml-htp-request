import { useRequestBackendController } from './controller';
import { FormDataRequestEncoder, RawEncoder } from './encoders';
import { CreateErrorResponse, CreateResponse } from './helpers';
import {
  HttpBackend,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse,
  HeadersType,
  HttpErrorResponse,
} from './types';
import { toBinary } from './utils';

// Get all request headers as dictionary data structure
function getResponseHeaders(headers: string) {
  const result: Record<string, any> = {};
  for (const header of headers.split('\r\n')) {
    let [name, value] = header.split(': ');
    if (
      name !== '' &&
      typeof name !== 'undefined' &&
      value !== null &&
      typeof value !== 'undefined'
    ) {
      result[name] = value;
    }
  }
  return result;
}

/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
 */
function getResponseUrl(xhr: any): string | null {
  if ('responseURL' in xhr && xhr.responseURL) {
    return xhr.responseURL;
  }
  if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
    return xhr.getResponseHeader('X-Request-URL');
  }
  return null;
}

/**
 * @description Query for content-type header in the list
 * of user provided headers
 */
function getContentType(headers: HeadersType) {
  for (const header in headers) {
    if (header?.toLocaleLowerCase() === 'content-type') {
      return headers[header] as string;
    }
  }
  return 'application/json;charset=UTF-8';
}

// Reads & parse the Http response body
// @internal
function getResponseBody(responseType: string, body: any, ok: boolean) {
  if (responseType === 'json' && typeof body === 'string') {
    // Save the original body, before attempting XSSI prefix stripping.
    const originalBody = body;
    body = body.replace(/^\)\]\}',?\n/, '');
    try {
      // Attempt the parse. If it fails, a parse error should be delivered to the user.
      body = body !== '' ? JSON.parse(body) : null;
    } catch (error) {
      // Since the JSON.parse failed, it's reasonable to assume this might not have been a
      // JSON response. Restore the original body (including any XSSI prefix) to deliver
      // a better error response.
      body = originalBody;

      // If this was an error request to begin with, leave it as a string, it probably
      // just isn't JSON. Otherwise, deliver the parsing error to the user.
      if (ok) {
        // Even though the response status was 2xx, this is still an error.
        ok = false;
        // The parse error contains the text of the body that failed to parse.
        body = { error, text: body };
      }
    }
  }
  return [body, ok];
}

// Send the request using the provided client object
async function sendRequest(instance: XMLHttpRequest, request: HttpRequest) {
  const contentType = getContentType(request.options?.headers || {});
  if (typeof request.body === 'undefined' || request.body === null) {
    // Set the request header and send the request
    instance.setRequestHeader('content-type', contentType);
    return instance.send();
  }

  if (request.body instanceof FormData) {
    return instance.send(request.body);
  }

  if (contentType.indexOf('application/json') !== -1) {
    instance.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    return instance.send(JSON.stringify(request.body));
  }

  if (contentType.indexOf('multipart/form-data') !== -1) {
    const encoder = new FormDataRequestEncoder();
    instance.setRequestHeader(
      'content-type',
      'multipart/form-data; boundary=' + encoder.getBoundary()
    );
    return instance.send(toBinary(await encoder.encode(request.body)));
  }
  // const contentType =
  //   headers['content-type'] || 'application/x-www-form-urlencoded';
  instance.setRequestHeader('content-type', contentType);
  return instance.send(
    new RawEncoder(contentType).encode(request.body) as string
  );
}

// Get partial properties of the {@see XMLHttpRequest} object
// @internal
function partialXhr(instance: XMLHttpRequest) {
  const status = instance.status;
  const statusText = instance.statusText;
  const url = getResponseUrl(instance);
  const headers = getResponseHeaders(instance.getAllResponseHeaders());
  return { status, statusText, url, headers };
}

/**
 * Creates an XML Http Request object from the Request object
 * @internal
 */
function initXMLHttpRequest(xhr: XMLHttpRequest, request: HttpRequest) {
  // TODO: open the request
  xhr.open(request.method, request.url, true);

  if (request!.options!.responseType) {
    xhr.responseType = request!.options.responseType;
  }

  if (request.options!.withCredentials) {
    xhr.withCredentials = !!request.options!.withCredentials;
  }
  if (request.options!.timeout) {
    xhr.timeout = request.options!.timeout;
  }

  if (request.options!.onTimeout) {
    xhr.addEventListener('timeout', () => request.options!.onTimeout());
  }

  if (request.options?.onProgress) {
    const progress = xhr.upload ? xhr.upload : xhr;
    progress.addEventListener(
      'progress',
      function (
        this: XMLHttpRequestUpload,
        event: ProgressEvent<XMLHttpRequestEventTarget>
      ) {
        if (event.lengthComputable) {
          let percentCompleted = event['loaded'] / event['total'];
          request.options.onProgress({
            type: event.type,
            percentCompleted,
            loaded: event['loaded'],
            total: event['total'],
          } as HttpProgressEvent);
        }
      },
      false
    );
  }

  // Merge headers
  const headers = { ...(request.options.headers ?? {}) };
  for (const header in headers) {
    // Here we escape the content-type header when setting request headers
    // as the content type header is set when sending the request
    if (header?.toLocaleLowerCase() === 'content-type') {
      continue;
    }
    xhr.setRequestHeader(header, headers[header]);
  }
  return xhr;
}

// Creates an instance of {@see HttpBackend} object
// @internal
function createInstance(host: string = undefined) {
  const backend = new Object();

  // Defines the backend host property
  Object.defineProperty(backend, 'url', {
    value: host,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  // Defines the backend instance property
  Object.defineProperty(backend, 'instance', {
    value: new XMLHttpRequest(),
    writable: true,
    configurable: true,
    enumerable: true,
  });

  // Defines the backend host property
  Object.defineProperty(backend, 'host', {
    value: () => backend['url'],
  });

  // Returns the constructed backed object
  return backend as Object & {
    instance: XMLHttpRequest;
  };
}

/**
 * @description Provides an object for sending HTTP request using legacy
 * {@see XMLHttpRequest} object
 *
 * ```js
 * // Creates an {@see HttpBackend} instance for sending HTTP requesr
 * const backend = useXhrBackend(<URL>);
 *
 * // To send an HTTP request
 * const response = backend.handle({
 *  url: '', // Override default request url or use path
 *  method: 'POST',
 *  options: {
 *    headers: {
 *      'Content-Type': 'application/json'
 *    }
 *  },
 *  body: {
 *    // Request body
 *  }
 * }); // Promise<HttpResponse>
 * ```
 *
 */
export function useXhrBackend(url: string = undefined) {
  const backend = createInstance(url) as any as {
    instance: XMLHttpRequest;
  } & HttpBackend;

  // @internal
  let errorHandler: (e: ProgressEvent) => Promise<HttpErrorResponse>;
  //@internal
  let finishHandler: () => Promise<HttpResponse>;
  //@internal
  let progressHandler: (e: ProgressEvent) => void;

  Object.defineProperty(backend, 'handle', {
    value: (message: HttpRequest) => {
      return new Promise<HttpResponse>((resolve, reject) => {
        errorHandler = (
          (callback: Function) => (e: ProgressEvent) =>
            callback(backend.onError(e))
        )(reject);
        finishHandler = (
          (callback: Function) => () =>
            callback(backend.onLoad())
        )(resolve);
        progressHandler = (
          (_request) => (e: ProgressEvent) =>
            message.options?.onProgress(backend.onProgess(e))
        )(message);
        backend.instance = initXMLHttpRequest(backend.instance, message);
        backend.instance.addEventListener('load', finishHandler);
        // When an HTTP Error Occurs
        backend.instance.addEventListener('error', errorHandler);
        // Listen for progess event and call user registered
        // callback
        if (
          typeof message.options?.onProgress === 'function' &&
          message.options?.onProgress
        ) {
          const progress = backend.instance.upload
            ? backend.instance.upload
            : backend.instance;
          progress.addEventListener('progress', (e) => {
            message.options?.onProgress(backend.onProgess(e));
          });
        }
        // If the request body is an instance of FormData object,
        // we simply pass it to the send method for POST request
        sendRequest(backend.instance, message);
      });
    },
  });
  Object.defineProperty(backend, 'onProgess', {
    value: (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
      if (event.lengthComputable) {
        let percentCompleted = event['loaded'] / event['total'];
        return {
          type: event.type,
          percentCompleted,
          loaded: event['loaded'],
          total: event['total'],
        } as HttpProgressEvent;
      }
    },
  });

  Object.defineProperty(backend, 'onLoad', {
    value: () => {
      const _body =
        typeof backend.instance.response === 'undefined'
          ? backend.instance.responseText
          : backend.instance.response;
      let { status, statusText, url, headers } = partialXhr(backend.instance);
      status = status === 0 ? (!!_body ? 200 : 0) : status;
      const [body, ok] = getResponseBody(
        backend.instance.responseType,
        _body,
        status >= 200 && status < 300
      );
      if (ok) {
        return CreateResponse({
          response: body,
          responseType: backend.instance.responseType,
          headers,
          url: url || undefined,
          status: status,
          statusText: statusText || 'OK',
        });
      } else {
        return CreateErrorResponse({
          error: body,
          headers,
          status: status || 0,
          statusText: statusText || 'Unknown Error',
          url: url || undefined,
        });
      }
    },
  });

  Object.defineProperty(backend, 'onError', {
    value: (event: ProgressEvent) => {
      const { status, statusText, url, headers } = partialXhr(backend.instance);
      return CreateErrorResponse({
        error: ProgressEvent,
        status: status,
        headers,
        statusText: statusText || 'Unknown Error',
        url: url || undefined,
      });
    },
  });

  Object.defineProperty(backend, 'abort', {
    value: (req: HttpRequest) => {
      // On a cancellation, remove all registered event listeners.
      if (errorHandler) {
        backend.instance.removeEventListener('error', errorHandler);
        backend.instance.removeEventListener('abort', errorHandler);
        backend.instance.removeEventListener('timeout', errorHandler);
      }
      if (finishHandler) {
        backend.instance.removeEventListener('load', finishHandler);
      }
      if (req.options?.onProgress && progressHandler) {
        backend.instance.removeEventListener('progress', progressHandler);
        if (req.body !== null && backend.instance.upload) {
          backend.instance.upload.removeEventListener(
            'progress',
            progressHandler
          );
        }
      }
      // Finally, abort the in-flight request.
      if (backend.instance.readyState !== backend.instance.DONE) {
        backend.instance.abort();
      }
    },
  });

  Object.defineProperty(backend, 'onDestroy', {
    value: (request?: HttpRequest) => {
      backend.abort(request);
      backend.instance = undefined;
    },
  });
  return backend;
}

//Creates a backend controller on top the xhr client
export function xhrBackendController(url: string) {
  return useRequestBackendController(useXhrBackend(url));
}
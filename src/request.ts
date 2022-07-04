import { usePipeline } from './interceptors';
import {
  Interceptor,
  NextFunction,
  HttpRequest,
  RequestInterface,
  HttpBackend,
} from './types';
import { URIHelper } from './url';
import { arrayIncludes, isValidHttpUrl, getHttpHost } from './utils';
import { Request } from './helpers';

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
 * @description Creates a client object for making request
 */
export function useClient(
  backend: HttpBackend,
  interceptors: Interceptor<HttpRequest>[] = []
) {
  const client = new Object();
  Object.defineProperty(client, 'request', {
    value: (request: RequestInterface) => {
      let pipe =
        request.options?.interceptors || ([] as Interceptor<HttpRequest>[]);
      if (Array.isArray(interceptors) && interceptors.length > 0) {
        pipe = [...pipe, ...interceptors];
      }
      // Push an interceptor that apply url search parameters if the request is a get
      // request
      pipe.push((request: HttpRequest, next: NextFunction<HttpRequest>) => {
        const url = !isValidHttpUrl(request.url)
          ? `${getHttpHost(backend.getURL() ?? '')}/${request.url}`
          : request.url;
        // Default headers to use when client does not provide a headers options
        const defaultHeaders = {
          accept: 'application/json',
          'cache-control': 'no-cache',
          'x-requested-with': 'XMLHttpRequest',
        };
        const headers = request.options?.headers ?? {};
        for (const header in headers) {
          defaultHeaders[header?.toLocaleLowerCase()] = headers[header];
        }
        const options = request.options ?? {};
        request = request.clone({
          url:
            !arrayIncludes(
              ['post', 'path', 'options'],
              request.method?.toLocaleLowerCase() ?? ''
            ) && request.body
              ? URIHelper.buildSearchParams(url, request.body)
              : url,
          options: {
            ...options,
            headers: defaultHeaders,
            responseType: request?.options.responseType || 'json',
          },
        });
        return next(request);
      });
      const _request = Request(request);
      // Call the request pipeline function and invoke the actual request client instance send method
      return usePipeline(...pipe)(_request, (message) =>
        backend.handle(message)
      );
    },
    writable: false,
  });
  return client as Object & {
    request: (message: RequestInterface) => Promise<Response>;
  };
}

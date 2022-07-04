import { usePipeline } from './interceptors';
import {
  Interceptor,
  NextFunction,
  HttpRequest,
  RequestInterface,
  HttpBackend,
  HttpBackendController,
} from './types';
import { URIHelper } from './url';
import { arrayIncludes, isValidHttpUrl, getHttpHost } from './utils';
import { Request } from './helpers';
import { HttpResponse } from './public-api';

/**
 * @description Creates a client object for making request
 */
export function useClient(
  backend: HttpBackend | HttpBackendController<HttpRequest, HttpResponse>,
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
          ? `${getHttpHost(backend.host() ?? '')}/${request.url}`
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

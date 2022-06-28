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

export type Request = {
  method: string;
  url: string;
  options: RequestOptions;
};

export type Requestheaders = { [index: string]: any };

export type RequestOptions = {
  headers?: Requestheaders;
  timeout?: number;
  withCredentials?: boolean;
  onProgress?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  onError?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  onTimeout: (event: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  body: FormData | Object | unknown;
};

/**
 * Creates an XML Http Request object from the Request object
 */
export function useXMLHttpRequest(request: Request) {
  const xhr = new XMLHttpRequest();

  // TODO: open the request
  xhr.open(request.method, request.url, true);

  if (request.options?.withCredentials) {
    xhr.withCredentials = !!request.options?.withCredentials;
  }

  // TODO: Register to the load event
  xhr.addEventListener(
    'load',
    (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
      // Resolve promise
    }
  );
  // TODO: If request timeout
  if (request.options?.timeout) {
    xhr.timeout = request.options?.timeout;
  }

  // TODO: Subscribe to timeout event
  if (request.options?.onTimeout) {
    xhr.addEventListener(
      'timeout',
      (event: ProgressEvent<XMLHttpRequestEventTarget>) =>
        request.options.onTimeout(event)
    );
  }

  // TODO : Subscribe to error event
  if (request.options?.onError) {
    xhr.addEventListener(
      'error',
      (event: ProgressEvent<XMLHttpRequestEventTarget>) =>
        request.options.onError(event)
    );
  }

  // TODO : Subscribe to progess event
  if (request.options?.onProgress) {
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
  const headers = request.options?.headers
    ? { ...defaultHeaders, ...request.options.headers }
    : defaultHeaders;

  // TODO : Use the default headers constant
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

  return xhr;
}

// Form data entry object interface definition
export type FormDataEntry = File | string | FormDataEntryValue;

// HTTP response object interface definition
export type ResponseType =
  | 'arraybuffer'
  | 'text'
  | 'blob'
  | 'json'
  | 'document';

// HTTP request object interface definition
export type HTTPRequestMethods =
  | 'GET'
  | 'DELETE'
  | 'OPTION'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'get'
  | 'delete'
  | 'option'
  | 'head'
  | 'post'
  | 'put'
  | 'patch';

export type RequestType = {
  method: HTTPRequestMethods;
  url: string;
  options?: RequestOptions;
  body: FormData | Record<string, string | File | FormDataEntryValue> | undefined;
};

// Request object interface definition
export type RequestInterface = RequestType & {
  clone(properties?: { [prop: string]: any }): any;
};

// Response object interface definitions
export type ResponseInterface = {
  responseType: XMLHttpRequestResponseType;
  responseText: string;
  responseURL: string;
  response: ArrayBuffer | string | Blob | unknown;
  statusCode: number;
  statusText: string;
};

// Request headers object interface definition
export type RequestHeaders = HeadersInit;

// Pipelines types definitions
export type NextFunction<T> = (
  request: T
) => ResponseInterface | Record<string, any>;

// Request interceptor type definition
export type Interceptor<T> = (message: T, next: NextFunction<T>) => any;

// Request options object interface definitions
export type RequestOptions = {
  // Defines request options used by the request client
  headers?: RequestHeaders;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: ResponseType;

  // Request options methods for interacting with request
  onProgress?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  onError?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  onTimeout?: (event: ProgressEvent<XMLHttpRequestEventTarget>) => void;

  // Interceptors options definitions
  interceptors?: Interceptor<RequestInterface>[];
};

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

// Type definition of a request interface object
// @internal
export type RequestInterface = {
  method: HTTPRequestMethods;
  url: string;
  options?: RequestOptions;
  body?: FormData | Record<string, string | File | FormDataEntryValue>;
};

// Request object interface definition
export type HttpRequest = RequestInterface & {
  clone(properties?: { [prop: string]: any }): any;
};

// Response object interface definitions
// @internal
export type HttpResponse = {
  responseType: XMLHttpRequestResponseType;
  response: ArrayBuffer | string | Blob | Document;
  status: number;
  statusText: string;
  headers: HeadersType;
  url: string|undefined;
};

// Http Error Response type definition
export type HttpErrorResponse = {
  status: number;
  statusText: string;
  error: string | any;
  url?: string;
  headers: HeadersType;
};

// Request headers object interface definition
export type HeadersType = HeadersInit;

// Pipelines types definitions
export type NextFunction<T> = (
  request: T
) => HttpResponse | Record<string, any>;

// Request interceptor type definition
export type Interceptor<T> = (message: T, next: NextFunction<T>) => any;

// Progress object type
export type HttpProgressEvent = {
  type?: string;
  loaded: number;
  total: number;
  percentCompleted: number;
};

// Request options object interface definitions
export type RequestOptions = {
  // Defines request options used by the request client
  headers?: HeadersType;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: ResponseType;

  // Request options methods for interacting with request
  onProgress?: (e: HttpProgressEvent) => void;
  onTimeout?: () => void;

  // Interceptors options definitions
  interceptors?: Interceptor<HttpRequest>[];
};

// Request backend provider interface definition
export type HttpBackend = {
  // Handle Http Request and Request events
  handle(request: HttpRequest): Promise<HttpResponse>;
  host: () => string | undefined;
  onProgess?: (event: ProgressEvent) => HttpProgressEvent;
  onLoad: () => Promise<HttpResponse>;
  onError: (event: ProgressEvent) => HttpErrorResponse;

  // Cleanup resources when get call
  onDestroy?: (request?: HttpRequest) => void;
  abort?: (request?: HttpRequest) => void;
};

// Http Request Controller type definition
export type HttpBackendController<T, R> = Object & {
  backend: HttpBackend;
  // Cancel the currently ongoing request
  cancel(request: T): () => void;
  // Send the request
  handle(request: T): Promise<R>;
  // Returns the request URL
  host: () => string | undefined;
};

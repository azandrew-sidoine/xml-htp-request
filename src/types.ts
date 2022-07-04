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
export type HttpResponse = {
  responseType: XMLHttpRequestResponseType;
  url: string;
  response: ArrayBuffer | string | Blob | Document;
  status: number;
  statusText: string;
  headers: HeadersInit;
};

export type HttpErrorResponse = {
  status: number;
  statusText: string;
  error: string | any;
  url?: string;
  headers: HeadersInit;
};

// Request headers object interface definition
export type RequestHeaders = HeadersInit;

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
  headers?: RequestHeaders;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: ResponseType;

  // Request options methods for interacting with request
  onProgress?: (e: HttpProgressEvent) => void;
  onError?: (e: HttpErrorResponse) => void;
  onTimeout?: () => void;

  // Interceptors options definitions
  interceptors?: Interceptor<HttpRequest>[];
};

// Request backend provider interface definition
export type HttpBackend = {
  handle(request: HttpRequest): Promise<HttpResponse>;
  getURL: () => string | undefined;
  onProgess?: (event: ProgressEvent) => HttpProgressEvent;
  onLoad: () => Promise<HttpResponse>;
  onError: (event: ProgressEvent) => HttpErrorResponse;
};

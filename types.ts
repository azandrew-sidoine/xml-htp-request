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

// Request object interface definition
export type Request = {
  method: HTTPRequestMethods;
  url: string;
  options?: RequestOptions;
  body: FormData | Record<string, string | File | FormDataEntryValue> | unknown;
};

// Response object interface definitions
export type Response = {
  responseType: XMLHttpRequestResponseType;
  responseText: string;
  responseURL: string;
  response: ArrayBuffer | string | Blob | unknown;
  statusCode: number;
  statusText: string;
};

// Request headers object interface definition
export type Requestheaders = HeadersInit;

// Request interceptor function definition
type RequestInterceptor = (request: Request) => Request;

// Response interceptor function definition
type ResponseInterceptor = <T>(response: Response) => T;

// Request options object interface definitions
export type RequestOptions = {
  // Defines request options used by the request client
  headers?: Requestheaders;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: ResponseType;

  // Request options methods for interacting with request
  onProgress?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  onError?: (e: ProgressEvent<XMLHttpRequestEventTarget>) => void;
  onTimeout?: (event: ProgressEvent<XMLHttpRequestEventTarget>) => void;

  // Interceptors options definitions
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
};

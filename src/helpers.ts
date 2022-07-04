import { Cloneable } from './clone';
import {
  HttpErrorResponse,
  HttpRequest,
  HttpResponse,
  RequestInterface,
} from './types';

/**
 * @description Creates a clonable request object that adds a clone method to object provided
 * by the as parameter allowing middleware to clone request
 * using ```js request = request.clone({}); ``` calls.
 */
export function Request(request: RequestInterface) {
  return Cloneable(Object, { ...request }) as HttpRequest;
}

/**
 * @description Creates a response object containing request response
 */
export function CreateResponse(response: HttpResponse) {
  return Cloneable(Object, { ...response }) as HttpResponse & {
    clone(properties: Partial<HttpResponse>): HttpResponse;
  };
}

/**
 * @description Creates an http error response instance
 */
export function CreateErrorResponse(response: HttpErrorResponse) {
  return Cloneable(Object, { ...response }) as any as HttpErrorResponse;
}

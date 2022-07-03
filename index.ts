import './style.css';
import { Clonable, createCloneable } from './src/clone';

type NextFunction<T> = (request: T) => any;
type Interceptor<T> = (message: T, next: NextFunction<T>) => any;


function middleware(request: Clonable, next: NextFunction<Clonable>) {
  request = request.clone({
    options: {
      headers: { 'Content-Type': 'application/json' },
    },
  });
  const response = next(request);
  return response;
}

function middleware2(request: Clonable, next: NextFunction<Clonable>) {
  request = request.clone({
    url: request.url?.replace('http://', 'https://'),
    options: {
      headers: { Authorization: 'Bearer <TOKEN>' },
    },
  });
  const response = next(request);
  return response;
}

function middleware3(request: Clonable, next: NextFunction<Clonable>) {
  request = request.clone({
    options: {
      responseType: 'blob',
    },
  });
  const response = next(request);
  const options = response.options || {};
  return {
    ...response,
    options: {
      ...options,
      headers: {
        ...(options.headers || {}),
        Accept: 'application/json'
      }
    }
  };
}

/**
 * Creates a pipeline of callable that intercept 
 * the request and the response returned by the request handler 
 */
function usePipeline<T>(...interceptors: Interceptor<T>[]) {
  return (message: T, next: NextFunction<T>) => {
    const nextFunc = (_message: T, interceptor: Interceptor<T>) => {
      return interceptor(_message, (request: T) => request);
    };
    const stack = [(request: T) => next(request)];
    if (interceptors.length === 0) {
      interceptors.push((request: T, next: NextFunction<T>) => {
        return next(request);
      });
    }
    let index = 1;
    for (const func of interceptors.reverse()) {
      const previous = stack[index - 1];
      stack.push((request: T) => {
        if (typeof previous !== 'function') {
          throw new Error('Interceptor function must be a callable instance');
        }
        return func(request, previous);
      });
      index += 1;
    }
    return nextFunc(message, stack[stack.length - 1]);
  };
}

const original = createCloneable(Object, { url: 'http://localhost:8000' });
console.log(usePipeline(middleware, middleware2, middleware3)(original, (request) => {
  const headers = {
    ...(request.options.headers || {}),
    ...{ Origin: request.url }
  };
  return {
    status: 422,
    options: {
      headers,
      responseType: 'blob'
    }
  }
}));

console.log(original);

usePipeline()(original, (request: any) => {
  return {
    status: 422,
    options: {
      responseType: 'blob',
      headers: {
        Origin: request.url
      }
    },
  }
});
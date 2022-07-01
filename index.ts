import './style.css';
import { createCloneable } from './src/clone';

type NextFunction<T = Clonable> = (request: T) => void;

type Interceptor<T = Clonable> = (message: T, next: NextFunction<T>) => any;

type Clonable = { [index: string]: any } & {
  clone(properties?: { [prop: string]: any }): Clonable;
};

function middleware(request: Clonable, next: NextFunction) {
  request = request.clone({
    options: {
      headers: { 'Content-Type': 'application/json' },
    },
  });
  return next(request);
}

function middleware2(request: Clonable, next: NextFunction) {
  request = request.clone({
    url: request.url?.replace('http://', 'https://'),
    options: {
      headers: { Authorization: 'Bearer <TOKEN>' },
    },
  });
  console.log(request);
  return next(request);
}

function middleware3(request: Clonable, next: NextFunction) {
  request = request.clone({
    options: {
      responseType: 'blob',
    },
  });
  return next(request);
}

function createStack<T extends Clonable>(...interceptors: Interceptor<T>[]) {
  return (message: T, next: (message: T) => any) => {
    const nextFunc = (_message: T) => _message.clone();
    for (const interceptor of interceptors) {
      message = interceptor(message, nextFunc);
    }
    return next(message);
  };
}

const interceptorsStack = createStack(
  ...[middleware, middleware2, middleware3]
);

const original = createCloneable(Object, { url: 'http://localhost:8000' });
interceptorsStack(original, (request) => {
  console.log('Request:', request);
  console.log('Typeof Request:', typeof request);
});

import { Interceptor, NextFunction } from './types';

/**
 * Creates a pipeline of callable that intercept
 * the request and the response returned by the request handler
 */
export function usePipeline<T>(...pipeline: Interceptor<T>[]) {
  return (message: T, next: NextFunction<T>) => {
    const nextFunc = (_message: T, interceptor: Interceptor<T>) => {
      return interceptor(_message, (request: T) => request);
    };
    const stack = [(request: T) => next(request)];
    if (pipeline.length === 0) {
      pipeline = [(request: T, callback: NextFunction<T>) => callback(request)];
    }
    for (const func of pipeline.reverse()) {
      const previous = stack.pop();
      if (typeof previous !== 'function') {
        throw new Error('Interceptor function must be a callable instance');
      }
      stack.push((request: T) => {
        return func(request, previous);
      });
    }
    return nextFunc(message, stack.pop() as Interceptor<T>);
  };
}

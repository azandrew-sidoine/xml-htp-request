import './style.css';

export function cloneProperties<T = object>(
  source: T,
  properties?: { [index: string]: any }
) {
  if (typeof properties === 'undefined' || properties === null) {
    return source;
  }
  for (const prop in properties) {
    const propIsObject = typeof properties[prop] === 'object';
    const objectIsUndefined =
      source[prop] === null || typeof source[prop] === 'undefined';
    const clonable = typeof source['clone'] === 'function';
    if (propIsObject && objectIsUndefined && clonable) {
      source[prop] = source['clone'](properties[prop]);
      continue;
    }
    setProperty(source, prop, properties[prop]);
  }
  return source;
}

export function setProperties<T = object>(
  source: T,
  properties: { [index: string]: any }
) {
  for (const prop in properties) {
    setProperty(source, prop, properties[prop]);
  }
  return source;
}

function setProperty<T = object>(source: T, prop: string, value: any) {
  const clonable =
    typeof source[prop] === 'object' &&
    typeof source[prop].clone === 'function';
  source[prop] = clonable ? source[prop].clone(value) : value;
}

export function createCloneable<T = object>(
  blueprint: new (...args: any) => T,
  ...args: any
) {
  const object = Object.create(blueprint, { ...args });
  object.prototype.constructor = (properties?: { [index: string]: any }) => {
    cloneProperties(this, { ...properties });
  };
  if (!object.hasOwnProperty('clone')) {
    object.prototype.clone = (properties?: { [index: string]: any }) => {
      const source = {};
      const decomposed = { ...this };
      for (const prop in decomposed) {
        console.log(prop);
        if (prop === 'url') {
          console.log(decomposed[prop]);
        }
        if (prop in properties) {
          continue;
        }
        source[prop] = decomposed[prop];
      }
      return setProperties(new blueprint({ ...properties }), { ...source });
    };
    // Object.defineProperty(object, 'clone', {
    //   value: (properties?: { [index: string]: any }) => {
    //     const source = {};
    //     const decomposed = { ...this };
    //     for (const prop in decomposed) {
    //       console.log(prop);
    //       if (prop === 'url') {
    //         console.log(decomposed[prop]);
    //       }
    //       if (prop in properties) {
    //         continue;
    //       }
    //       source[prop] = decomposed[prop];
    //     }
    //     return setProperties(new blueprint({ ...properties }), { ...source });
    //   },
    //   writable: false,
    // });
  }
  return object as T;
}

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

// class Clone implements Clonable {
//   public constructor(properties?: { [index: string]: any }) {
//     cloneProperties(this, { ...properties });
//   }

//   public clone(properties?: { [index: string]: any }) {
//     return setProperties(new Clone({ ...properties }), { ...this });
//   }
// }

const original: any = createCloneable(Object, { url: 'http://localhost:8000' });
interceptorsStack(original, (request) => {
  console.log('Request:', request);
  console.log('Typeof Request:', typeof request);
});

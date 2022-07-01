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

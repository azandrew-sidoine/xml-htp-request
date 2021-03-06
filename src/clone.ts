export type Clonable = { [index: string]: any } & {
  clone(properties?: { [prop: string]: any }): Clonable;
};

function cloneProperties<T extends { [index: string]: any }>(
  source: T,
  properties?: Record<string, any>
) {
  if (typeof properties === 'undefined' || properties === null) {
    return source;
  }
  for (const prop in properties) {
    const key = prop as any;
    const propIsObject = typeof properties[prop] === 'object';
    const objectIsUndefined =
      source[prop] === null || typeof source[prop] === 'undefined';
    const clonable = typeof source['clone'] === 'function';
    if (propIsObject && objectIsUndefined && clonable) {
      defineProperty(source, key, source['clone'](properties[prop]));
      continue;
    }
    setProperty(source, prop, properties[prop]);
  }
  return source;
}

function setProperty<T extends { [index: string]: any }>(
  source: T,
  prop: string,
  value: any
) {
  const clonable =
    typeof source[prop] === 'object' &&
    typeof source[prop].clone === 'function';
  defineProperty(source, prop, clonable ? source[prop].clone(value) : value);
}

function defineProperty(object_: object, prop: string, value: any) {
  const descriptors = Object.getOwnPropertyDescriptor(object_, prop) ?? {};
  // Modify object applying overriding my descriptors with the defaults
  Object.defineProperty(object_, prop, {
    // TODO : Use default if no previous descriptor
    ...{
      writable: true,
      configurable: true,
      enumerable: true,
    },
    // Build with old descriptors by decomposition
    ...descriptors,
    // TODO : Modify the value
    value: value,
  });
}

function Clone(this: any, properties?: { [index: string]: any }) {
  properties = properties || {};
  const source: Record<string, any> = {};
  // We do not clone functions definitions therefore we loop through
  // object properties and remove the keys that are function before proceeeding
  for (const prop in properties) {
    if (typeof properties[prop] === 'function') {
      continue;
    }
    source[prop] = properties[prop];
  }
  cloneProperties(this, { ...source });
}

export function createCloneable<T>(bluePrint: new () => T, args: any) {
  const propertiesDescriptorsMap: PropertyDescriptorMap = {};
  for (const prop in args) {
    propertiesDescriptorsMap[prop] = {
      value: args[prop],
      writable: true,
      configurable: true,
      enumerable: true,
    };
  }
  const obj = Object.create(bluePrint, propertiesDescriptorsMap);
  const instance = new obj.prototype.constructor();
  instance.constructor = bluePrint;
  // Make every object to the properties parameter clonable
  for (const prop in args) {
    const value = args[prop];
    const typeofValue = typeof value;
    if (typeofValue === 'function') {
      continue;
    }
    if (typeofValue === 'undefined' || value === null) {
      continue;
    }
    if (typeofValue === 'object') {
      instance[prop] = createCloneable(value.constructor ?? Object, value);
    }
    instance[prop] = value;
  }
  Object.defineProperty(instance, 'clone', {
    value: (properties?: { [index: string]: any }) => {
      const object$ = { ...instance };
      for (const prop in properties) {
        const value = properties[prop];
        const valueType = typeof value;
        if (valueType === 'function') {
          continue;
        }
        if (valueType === 'undefined' || value === null) {
          continue;
        }
        if (valueType === 'object') {
          object$[prop] = createCloneable(
            value.constructor || Object,
            value
          ).clone(instance[prop] || {});
          continue;
        }
        object$[prop] = value;
      }
      return createCloneable(instance.constructor || Object, object$);
    },
  });
  return instance as Clonable;
}

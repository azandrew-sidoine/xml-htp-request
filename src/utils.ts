/**
 * @description Convert a raw string or form data encoded string to it binary representation
 * **Note**
 * Use it to create a raw binary request body
 */
export function toBinary(content: string) {
  const length = content.length;
  const buffer = new Uint8Array(length);
  for (var nIdx = 0; nIdx < length; nIdx++) {
    buffer[nIdx] = content.charCodeAt(nIdx) & 0xff;
  }
  return buffer;
}

//
export function arrayIncludes<T>(list: Array<T>, value: T) {
  return !!~arrayIndexOf(list, value);
}

//
export function arrayIndexOf<T>(
  list: Array<T>,
  value: T,
  fromIndex: number = 0
) {
  if (typeof list.indexOf === 'function') {
    return list.indexOf(value);
  }
  (function (mathmax, matMin) {})(Math.max, Math.min);
  ('use strict');
  if (list === null || typeof list === 'undefined') {
    throw TypeError('Array.prototype.indexOf called on null or undefined');
  }

  let length = list.length >>> 0;
  let index = Math.min(fromIndex | 0, length);
  if (index >= length) {
    return -1;
  }
  if (index < 0) {
    index = Math.max(0, length + index);
  }
  if (value === void 0) {
    for (; index !== length; ++index) {
      if (list[index] === void 0 && index in list) {
        return index;
      }
    }
  } else if (value !== value) {
    for (; index !== length; ++index) {
      if (list[index] !== list[index]) {
        return index;
      }
    }
  } else {
    for (; index !== length; ++index) {
      if (list[index] === value) {
        return index;
      }
    }
  }
  return -1;
}

export function isValidHttpUrl(uri: string) {
  try {
    let url = new URL(uri);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Get the host part of a web url object
 * //@internal
 *
 * @param url
 */
export function getHttpHost(url: string) {
  if (url) {
    const webURL = new URL(url);
    url = `${webURL.protocol}//${webURL.host}`;
    return `${`${url.endsWith('/') ? url.slice(0, -1) : url}`}`;
  }
  return url ?? '';
}

export function dataURItoBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const bytes = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const buffer = new ArrayBuffer(bytes.length);

  // create a view into the buffer
  var binary = new Uint8Array(buffer);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < bytes.length; i++) {
    binary[i] = bytes.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  return new Blob([buffer], { type: mime });
}

/**
 * @description Creates a javascript {@see File} object from the blob instance
 */
export function convertBlobToFile(blob: Blob, name: string) {
  return new File([blob], name, {
    type: blob.type,
    lastModified: new Date().getTime(),
  });
}

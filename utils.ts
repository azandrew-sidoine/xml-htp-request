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

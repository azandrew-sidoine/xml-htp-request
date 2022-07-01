import { FormDataEntry } from './types';

export interface Encoder {
  encode(body: Record<string, FormDataEntry>): Promise<string> | string;
}

//#region Form Data Encoder
export class FormDataRequestEncoder implements Encoder {
  // Encoder boundary private property
  private boundary: string = undefined;

  public constructor() {
    this.boundary = this.createBoundary();
  }

  // Creates a form data request boundary
  private createBoundary() {
    return '---------------------------' + Date.now().toString(16);
  }

  // Return the form data encoder boundary value
  public getBoundary() {
    return this.boundary;
  }

  // Blob content encoding implementation
  private encodeBlob(name: string, filename: string, blob: Blob) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      let content =
        'Content-Disposition: form-data; name="' +
        name +
        '"; filename="' +
        filename +
        '"\r\nContent-Type: ' +
        blob.type +
        '\r\n\r\n';
      reader.addEventListener('load', (e: ProgressEvent<FileReader>) => {
        content += e.target.result + '\r\n';
        resolve(content);
      });
      reader.readAsBinaryString(blob);
    });
  }

  private encodeText(name: string, value: string) {
    return (
      'Content-Disposition: form-data; name="' +
      name +
      '"\r\n\r\n' +
      value +
      '\r\n'
    );
  }

  // Encode the request body into a raw string
  async encode(body: Record<string, FormDataEntry>): Promise<string> {
    // oAjaxReq.setRequestHeader("Content-Type", "multipart\/form-data; boundary=" + sBoundary);
    const segments: Promise<string>[] = [];
    for (const prop in body) {
      const value = body[prop];
      if (typeof value === 'string') {
        segments.push(
          new Promise((resolve) => {
            resolve(this.encodeText(prop, value));
          })
        );
        continue;
      }
      segments.push(this.encodeBlob(prop, value.name, value));
    }
    const content = await Promise.all(segments);
    return (
      '--' +
      this.boundary +
      '\r\n' +
      content.join('--' + this.boundary + '\r\n') +
      '--' +
      this.boundary +
      '--\r\n'
    );
  }
}
//#endregion Form Data Encoder

//#region Raw Text encoder
export class TextEncoder implements Encoder {
  // Encoder content type
  private contentType: string = undefined;

  // Creates an instance of the Request encoder
  public constructor(contentType: string) {
    this.contentType = contentType;
  }

  // Provides encoding implementation
  encode(body: Record<string, string>): string | Promise<string> {
    const segments = [];
    for (const prop in body) {
      segments.push(URL.encodeText(prop, body[prop]));
    }
    return segments.join(this.contentType === 'text/plain' ? '\r\n' : '&');
  }
}
//#endregion Raw Encoder

//#region Provide uri specific utilities
export class URL {
  //
  // Provide the actual implementation of encoding
  public static encodeText(
    name: string,
    value: string,
    contentType = 'text/plain'
  ) {
    return `${name}=${
      contentType === 'text/plain'
        ? value.replace(/[\s\=\\]/g, '\\$&')
        : encodeURIComponent(value)
    }`;
  }

  // Build uri with search parameter
  public static buildSearchParams(
    url: string,
    body: Record<string, string>,
    contentType: string = 'text/plain'
  ) {
    const segments = [];
    for (const prop in body) {
      segments.push(URL.encodeText(prop, body[prop], contentType));
    }
    return url.replace(
      /(?:\?.*)?$/,
      segments.length > 0 ? '?' + segments.join('&') : ''
    );
  }
}
//#endregion Provide uri specific utilities

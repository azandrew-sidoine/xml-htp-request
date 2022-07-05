import './style.css';
import {
  HttpRequest,
  useClient,
  NextFunction,
  convertBlobToFile,
  dataURItoBlob,
  xhrBackendController,
} from './src';
// import { dataURI } from './constrants';

const form = new FormData();
form.append('username', 'azandrewdevelopper@gmail.com');
form.append('password', 'homestead');
const client = useClient(xhrBackendController('https://auth.lik.tg/'));
client
  .request({
    url: 'api/v2/login',
    method: 'POST',
    options: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      interceptors: [
        (request, next: NextFunction<HttpRequest>) => {
          request = request.clone({
            options: {
              ...request.options,
              headers: {
                ...request.options?.headers,
                'x-authorization-client-id':
                  '859782E1-9A2F-49A4-9D42-B59A78E520FB',
                'x-authorization-client-secret':
                  'wJa60mWPUK2W8AycfziCrWeMWSus4HLAoSV9cq2qb6FTMlmEudoItlbUHwdUw15peIXmF2b2q2LwCYSO0fvvgQ',
              },
            },
          });
          const response = next(request);
          return response;
        },
      ],
      onProgress: (event: any) => {
        // Handle progress event
      },
    },
    // body: {
    //   username: 'azandrewdevelopper@gmail.com',
    //   password: 'homestead',
    // },
    body: form,
  })
  .then((res) => console.log('Request response: ', res))
  .catch((err) => console.log(err));

// const formData = new FormData();
// formData.append(
//   'content',
//   convertBlobToFile(dataURItoBlob(dataURI), 'image.jpg')
// );
// formData.append('description', 'FAUTEUIL BUREAU');

// // Create the request
// const req = {
//   url: 'api/storage/object/upload',
//   method: 'POST',
//   // body: {
//   //   content: convertBlobToFile(dataURItoBlob(dataURI), 'image.jpg'),
//   //   // parent: '96a6bfe8-0aff-46ac-b795-80c4a8af001d',
//   //   description: 'FAUTEUIL BUREAU',
//   // },
//   body: formData,
//   options: {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//     onProgress: (event: any) => {
//       console.log(event);
//     },
//     onError: (event: any) => {
//       console.log(event);
//     },
//   },
// };

// useClient(useXhrBackend('https://storage.lik.tg'), [
//   (request: RequestInterface, next: NextFunction<RequestInterface>) => {
//     request = request.clone({
//       options: {
//         ...request.options,
//         headers: {
//           ...request.options.headers,
//           'x-client-id': '96a6bba2-73e4-404c-9bb3-0d61c31bba44',
//           'x-client-secret':
//             '9NYHbYhzNXX2AbrxHs4H0cTmM7udeKEdqfwyTCXGLjnaU2IhmVldNwAknIpysbx5QZ8KBytvw1hW7qQE6iA',
//         },
//       },
//     });
//     return next(request);
//   },
// ])
//   .request(req as any)
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.log('Error : ', error);
//   });

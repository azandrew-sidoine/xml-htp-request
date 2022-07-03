import './style.css';
import { Cloneable } from './src/clone';
import { NextFunction, RequestInterface } from './src/types';
import { usePipeline } from './src/interceptors';
import { useClient, Request } from './src/request';

// function middleware(
//   request: RequestInterface,
//   next: NextFunction<RequestInterface>
// ) {
//   request = request.clone({
//     options: {
//       headers: { 'Content-Type': 'application/json' },
//     },
//   });
//   const response = next(request);
//   return response;
// }

// function middleware2(
//   request: RequestInterface,
//   next: NextFunction<RequestInterface>
// ) {
//   request = request.clone({
//     url: request.url?.replace('http://', 'https://'),
//     options: {
//       headers: { Authorization: 'Bearer <TOKEN>' },
//     },
//   });
//   const response = next(request);
//   return response;
// }

// function middleware3(
//   request: RequestInterface,
//   next: NextFunction<RequestInterface>
// ) {
//   request = request.clone({
//     options: {
//       responseType: 'blob',
//     },
//   });
//   const response = next(request);
//   return {
//     ...response,
//     responseText: 'Bad request',
//   };
// }

// const original = Cloneable(Object as any as new () => RequestInterface, {
//   url: 'http://localhost:8000',
// });
// console.log(
//   usePipeline(
//     middleware,
//     middleware2,
//     middleware3
//   )(original, (request) => {
//     const headers = {
//       ...(request.options.headers || {}),
//       ...{ Origin: request.url },
//     };
//     return {
//       status: 422,
//       options: {
//         headers,
//         responseType: 'blob',
//       },
//     };
//   })
// );

// console.log(
//   usePipeline()(original, (request: any) => {
//     return {
//       status: 422,
//       options: {
//         responseType: 'blob',
//         headers: {
//           Origin: request.url,
//         },
//       },
//     };
//   })
// );

const client = useClient();
const response = client.request(
  Request({
    url: 'https://auth.lik.tg/api/v2',
    method: 'GET',
    options: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    body: {
      username: 'azandrewdevelopper@gmail.com',
      password: 'homestead',
    },
  })
);

response.then((res) => console.log(res)).catch((err) => console.log(err));

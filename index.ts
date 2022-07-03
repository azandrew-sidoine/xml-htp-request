import './style.css';
import { RequestInterface, useClient, Request } from './src/public-api';
import { NextFunction } from './src/types';

const client = useClient('https://auth.lik.tg/');
const response = client.request(
  Request({
    url: 'api/v2/login',
    method: 'POST',
    options: {
      headers: {
        'Content-Type': 'application/json',
      },
      interceptors: [
        (request, next: NextFunction<RequestInterface>) => {
          request = request.clone({
            options: {
              ...request.options,
              headers: {
                ...request.options.headers,
                'x-authorization-client-id':
                  '859782E1-9A2F-49A4-9D42-B59A78E520FB',
                'x-authorization-client-secret':
                  'wJa60mWPUK2W8AycfziCrWeMWSus4HLAoSV9cq2qb6FTMlmEudoItlbUHwdUw15peIXmF2b2q2LwCYSO0fvvgQ',
              },
            },
          });
          return next(request);
        },
      ],
    },
    body: {
      username: 'azandrewdevelopper@gmail.com',
      password: 'homestead',
    },
  })
);

response
  .then((res) => console.log('Request response: ', res))
  .catch((err) => console.log(err));

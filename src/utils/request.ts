import { extend } from 'umi-request';

const request = extend({
  timeout: 3000,
});

request.interceptors.response.use(async (response) => {
  const data = await response.clone().json();
  if (data && data.NOT_LOGIN) {
    location.href = '登录url';
  }
  return response;
});

export default request;

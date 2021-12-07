import axios from 'axios';

const instance = axios.create({
  timeout: 3000,
  baseURL: '/'
});

instance.interceptors.request.use(function(config) {
  return config;
}, function(error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(function(resp) {
  return resp;
}, function(error) {
  return Promise.reject(error);
});

export default instance;
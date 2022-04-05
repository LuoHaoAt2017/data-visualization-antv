// import { request } from 'umi';
import request from '@/utils/request';

export const GetWorkers = () => {
  return request('/workers', {
    method: 'GET',
  });
};

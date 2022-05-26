// import { request } from 'umi';
import request from '@/utils/request';

export const GetDutyList = () => {
  return request('/api/dutys', {
    method: 'get',
  });
};

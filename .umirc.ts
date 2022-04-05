import { defineConfig } from 'umi';

export default defineConfig({
  title: 'The Grammar of Graphics',
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        {
          path: '/home',
          component: '@/pages/home',
          name: 'L00000',
        },
        {
          path: '/grammar',
          component: '@/pages/grammar',
          name: 'L00001',
        },
        {
          path: '/parts',
          component: '@/pages/parts',
          name: 'L00002',
        },
        {
          path: '/geometry',
          component: '@/pages/geometry',
          name: 'L00003',
        },
        {
          path: '/workers',
          component: '@/pages/works',
          name: 'L00004',
        },
        {
          path: '/',
          redirect: '/workers',
        },
      ],
    },
  ],
  locale: {
    antd: true,
  },
  request: {
    dataField: 'data',
  },
  mock: {
    
  }
});

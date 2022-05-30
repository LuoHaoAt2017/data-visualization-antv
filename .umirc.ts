import { defineConfig } from 'umi';

export default defineConfig({
  title: 'The Grammar of Graphics',
  favicon: '/favicon.png',
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        {
          path: '/home',
          component: '@/pages/home',
          name: 'Mesg00000',
        },
        {
          path: '/grammar',
          component: '@/pages/grammar',
          name: 'Mesg00001',
        },
        {
          path: '/geometry',
          component: '@/pages/geometry',
          name: 'Mesg00003',
        },
        {
          path: '/g2',
          component: '@/pages/g2/index',
          routes: [
            {
              path: 'custom-shape',
              component: '@/pages/g2/custom-shape',
              name: 'Mesg00005',
            },
            {
              path: 'custom-label',
              component: '@/pages/g2/custom-label',
              name: 'Mesg00005',
            },
            {
              path: 'stack-histogram',
              component: '@/pages/g2/stack-histogram',
              name: 'Mesg00004',
            },
            {
              path: 'after-render',
              component: '@/pages/g2/after-render',
              name: 'Mesg00005',
            },
          ],
        },
        {
          path: '/',
          redirect: '/g2',
        },
      ],
    },
  ],
  locale: {
    antd: true,
  },
  history: {
    type: 'browser',
  },
  mock: {},
  devServer: {
    port: 9000,
  },
});

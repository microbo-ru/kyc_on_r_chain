import Vue from 'vue';
import Router from 'vue-router';
import Ping from '@/components/Ping';
import Persons from '@/components/Persons';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Persons',
      component: Persons,
    },
    {
      path: '/ping',
      name: 'Ping',
      component: Ping,
    },
  ],
  mode: 'hash',
});

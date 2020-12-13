import 'bootstrap/dist/css/bootstrap.css';
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import Vuetify from 'vuetify'
import Vuex from 'vuex';
import App from './App';
import router from './router';
import Notifications from 'vue-notification'
import store from './store'

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
// Vue.use(Vuex)
Vue.use(Vuetify);
Vue.use(Notifications)

/* eslint-disable no-new */
window.vm = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});

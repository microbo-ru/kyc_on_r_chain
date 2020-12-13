import 'bootstrap/dist/css/bootstrap.css';
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import Vuetify from 'vuetify'
import Vuex from 'vuex';
import App from './App';
import router from './router';
// import '@tensorflow/tfjs-node';


// import * as faceapi from 'face-api.js' 

Vue.config.productionTip = false;

Vue.use(BootstrapVue);
// Vue.use(Vuex)
Vue.use(Vuetify);
import store from './store'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});

import Vue from 'vue'
import App from './App.vue'
import VueAnime from 'vue-animejs';

Vue.config.productionTip = false;
Vue.use(VueAnime);
new Vue({
  render: h => h(App),
}).$mount('#app')

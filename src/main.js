import Vue from 'vue'
import App from './App.vue'
import VueAnime from 'vue-animejs';
import AOS from 'aos';
import 'aos/dist/aos.css'

Vue.config.productionTip = false;
Vue.use(VueAnime);
Vue.use(AOS);

new Vue({
  created() {
    AOS.init()
  },
  render: h => h(App),
}).$mount('#app')

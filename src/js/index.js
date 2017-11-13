import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../app'
import routes from './routes'

Vue.config.productionTip = false
Vue.use(VueRouter)

new Vue({
  el: '#app',
  template: '<App/>',
  components: {
    App,
  },
  router: new VueRouter({
    routes,
  }),
})

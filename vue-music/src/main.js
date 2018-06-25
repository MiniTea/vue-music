import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyload from 'vue-lazyload'

import store from './store'

// 解决移动端点击3,秒延迟问题
import fastclick from 'fastclick'

import 'common/stylus/index.styl'

fastclick.attach(document.body)

// 图片懒加载
Vue.use(VueLazyload, {
    loading: require('common/image/default.png')
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App),
    router,
    store
})

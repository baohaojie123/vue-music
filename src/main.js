// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick'
import VueLazyload from 'vue-lazyload'
import { SET_PLAY_HISTORY, SET_FAVORITE_LIST } from './store/mutations-type'
import { loadPlay, loadFavorite } from 'common/js/cache'
import { processSongsUrl } from './common/js/song'
import 'common/stylus/index.styl'
// 避免eslint检查
/* eslint-disable no-unused-vars */
import vConsole from 'vconsole'

console.log('test')


// Vue.config.productionTip = false
// 整个body里面的元素的点击都没有300ms的延迟
fastclick.attach(document.body)
/* eslint-disable no-new */
Vue.use(VueLazyload, {
  // 默认图片
  loading: require('common/image/default.png')
})
const historySongs = loadPlay()
processSongsUrl(historySongs).then((songs) => {
  store.commit(SET_PLAY_HISTORY, songs)
})
const favoriteSongs = loadFavorite()
processSongsUrl(favoriteSongs).then((songs) => {
  store.commit(SET_FAVORITE_LIST, songs)
})
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

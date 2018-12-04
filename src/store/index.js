import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)
// npm run dev dev模式 npm run build 线上模式
const debug = process.env.NODE_ENV !== 'production'


export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  // debug模式下开启严格模式 线上模式关闭严格模式，提高性能
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

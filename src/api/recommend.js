import jsonp from 'common/js/jsonp'
// export default function jsonp (url, data, option) { 因为是 export default 所以 jsonp不加{}
import {commonParams, options} from './config'
import axios from 'axios'

// const debug = process.env.NODE_ENV !== 'production'
// 获取轮播图数据 此方法在组件中使用
export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  // 把 commonParams 和 后面{}中的内容 拼接到 第一个{}中
  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })
  // 此处应该return Promise；又因jsonp()返回Promise
  return jsonp(url, data, options)
}
// 获取歌单数据
export function getDiscList () {
  const url = 'api/getDiscList'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    // 默认是jsonp数据  但是我们想要的是json
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
// 获取歌曲列表数据的方法封装好了，在disc.vue中就可以发起这个请求，获取这个数据
export function getSongList (disstid) {
  const url = '/api/getSongList'
  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    // g_tk: 67232076
    g_tk: 487535770
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}


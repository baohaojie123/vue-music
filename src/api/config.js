export const commonParams = {
  g_tk: 5381,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}
// js请求的 Headers中 Query String Parameters里的最后一个属性名
export const options = {
  param: 'jsonpCallback'
}
// 所有接口code的返回值为 0 jsonp1({"code":0,
export const ERR_OK = 0

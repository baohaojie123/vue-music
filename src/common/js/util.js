// 洗牌函数
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) {
  // _arr是arr的一个副本
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
// 节流函数  参数 （函数，延迟时间）对某一个函数做节流，就会返回一个新的函数，新的函数就会延迟执行我们要节流的这个函数
// 在延迟期间，debounce函数又被调用了，之前的计时器就会清空，然后又会延迟执行func函数
// 所以如果debounce函数反复调用的话，我们想要被节流的func只能被调用一次
export function debounce (func, delay) {
  // 计时器
  let timer
  // 返回一个函数  ...args剩余参数用法允许我们将一个不定数量的参数表示为一个数组
  return function (...args) {
    // 如果这个debounce函数被执行了，就会有timer
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

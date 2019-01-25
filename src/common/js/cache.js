// 此js主要操作与storage相关的一些逻辑
import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15
// 历史播放列表
const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

// 存储的arr数组 我们要存的值val 定义一个比较函数compare 定义最大值maxLen
function insertArray (arr, val, compare, maxLen) {
  // findIndex查找当前数组中是否有某个元素
  const index = arr.findIndex(compare)
  // 第一条数据 什么都不用做
  if (index === 0) {
    return
  }
  // 数组中有这条数据，数据还不是在第一的位置，先把之前的数据删掉，然后插到数组中的第一个位置
  if (index > 0) {
    // 先把之前的数据删掉
    arr.splice(index, 1)
  }
  // 然后插到数组中的第一个位置
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    // 把数组的最后一个给pop出去
    arr.pop()
  }
}

function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}
// 保存搜索结果 返回一个新的数组
export function saveSearch (query) {
  // 先得到当前存储空间的情况，如果没有存过的话，默认是空数组，每插一条数据都会放到数组的前面
  // 如果数组中有重复的数据，需要把重复的数据给删掉，然后把新的数据插入到前面，就是最新搜索的结果总是在最前面
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}
// 删除搜索结果
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}
// 清空所有搜索结果
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}

export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}
// 保存播放历史
export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}
// 读播放历史
export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite (song) {
  console.log(FAVORITE_KEY)
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite (song) {
  var songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}



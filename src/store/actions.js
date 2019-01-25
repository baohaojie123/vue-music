// 1、异步操作
// 2、对mutation的封装，某个动作触发多个mutation时
import {playMode} from 'common/js/config'
import * as types from './mutations-type'
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
// index 对应的是顺序歌曲列表中对应的索引 对应到randomList列表中的索引是怎么样的
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    console.log(list)
    let randomList = shuffle(list)
    console.log(randomList)
    commit(types.SET_PLAYLIST, randomList)
    // 顺序列表中这首歌 对应到随机列表中是哪首歌曲 并返回这个歌曲的索引
    index = findIndex(randomList, list[index])
    console.log(index)
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 拿到state的原因：最终要拿到playlist currentIndex sequenceList
export const insertSong = function ({commit, state}, song) {
  // state.playlist.slice() 返回state.playlist的一个副本 因为我们不能再mutations回调函数外修改 [vuex] Do not mutate vuex store state outside mutation handlers.
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  // currentIndex只是playlist的当前索引 不是sequenceList的索引
  // state.currentIndex 是个值类型 修改变量不会有问题 所以不用副本
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引 顺序一定要在插入之前
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引+1
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // > -1说明已经有这首歌曲 =-1 没有这首歌曲
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      // 如果当前插入的序号大于列表中的序号
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 因为歌在fpIndex之前插入 所以pfIndex增加了一位
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // song 应该插入在sequenceList中的位置
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 寻找之前sequenceList里面有没有我们要插入的song
  let fsIndex = findIndex(sequenceList, song)
  // 插入
  sequenceList.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 存储搜索历史
export const saveSearchHistory = function ({commit}, query) {
  // 让搜索结果缓存到localstorage的方法 saveSearch最后返回一个存储列表
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
// 删除搜索历史
export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}
// 清空所有历史 不用带query 不需要任何参数
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}
// 删除播放列表中的歌曲
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  // 当前播放的索引在我们删除的索引之后 || 删除最后一首歌(currentIndex ===pIndex)
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 播放列表为空
  // if (!playlist.length) {
  //   commit(types.SET_PLAYING_STATE, false)
  // } else {
  //   commit(types.SET_PLAYING_STATE, true)
  // }
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}
// 清空播放列表中的所有歌曲，把以下值都置于初始状态
export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}
// 保存播放历史
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}

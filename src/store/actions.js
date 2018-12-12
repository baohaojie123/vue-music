// 1、异步操作
// 2、对mutation的封装，某个动作触发多个mutation时
import {playMode} from 'common/js/config'
import * as types from './mutations-type'
import {shuffle} from 'common/js/util'
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

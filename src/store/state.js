import { playMode } from 'common/js/config'
import { loadSearch } from 'common/js/cache'
// 公用数据 放vuex里面管理  state里面只保留最基础的数据 所有在基础数据上可以计算而来的数据直接放getters里面
const state = {
  singer: {},
  // 歌曲播放
  playing: false,
  // 播放器展开和收起
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 顺序列表    当时顺序播放的时候 playlist = sequenceList
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放的索引   currentSong可以根据currentIndex与playlist计算出来
  currentIndex: -1,
  // 歌单对象
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: [],
  favoriteList: []
}

export default state

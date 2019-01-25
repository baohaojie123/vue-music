export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

// 不缩写了
export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}
}
// 简单的一个mutation就可以搞定，不需要写到action
export const disc = state => state.disc

export const topList = state => state.topList

// export const searchHistory = state => state.searchHistory
export const searchHistory = (state) => {
  console.log(state.searchHistory)
  return state.searchHistory
}


export const playHistory = (state) => {
  console.log(state.playHistory)
  return state.playHistory
}

export const favoriteList = state => state.favoriteList

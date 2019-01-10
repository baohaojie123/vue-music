import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
// 这是几个组件共用的代码
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  // mounted 是组件渲染的生命周期钩子 ,el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子。
  // 在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。在整个实例中只执行一次
  // activated 是 keep-alive 组件切换激活的生命周期钩子
  // 这 2 个时期都需要做计算
  // 渲染触发 mounted ，keep-alive组件切换触发activated，需要在这 2 个时机都执行 handlePlaylist
  // 组件domready的时候触发
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  // keep-alive组件切换的时候触发
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    // handlePlaylist ()在具体的组件去实现 如果组件里没有这个函数 那么则调用mixin里面的这个函数
    handlePlaylist () {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}
// 播放模式
export const playerMixin = {
  computed: {
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode'
    ])
  },
  methods: {
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    }),
    changeMode () {
      // mode要通过vuex的mutation，设置到state上
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 修改Playlist 但是此时currentSong不变 playlist改变的时候 也要currentindex改变
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
      // 此时更换模式，如果暂停歌曲，更换模式之后就会播放歌曲，这是因为currentsong改变了，触发watch事件， 但是currentSong.id没有变
    },
    resetCurrentIndex (list) {
      // 在list里面找到当前歌曲对应的一个索引
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    }
  }
}
// 搜索歌曲

export const searchMixin = {
  data () {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    // 把search-box里面的input给blur（移开焦点）了 search是searbox的父组件，就可以调用子组件的方法,最终实现滚动之前，手机键盘收起的功能
    blurInput () {
      this.$refs.searchBox.blur()
    },
    // 保存搜索结果 如果这里的历史只需保存在组件中，则只需要调用mutation就可以。但是如果要保存到localStorage,实现永久保存，这里我们就需要封装一个action
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    onQueryChange (query) {
      // 处理带空格的情况
      this.query = query
    },
    addQuery (query) {
      // 把query设置进去
      this.$refs.searchBox.setQuery(query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}



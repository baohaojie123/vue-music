import {mapGetters} from 'vuex'
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

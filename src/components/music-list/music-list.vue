<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <!--歌曲列表渲染完再出现按钮-->
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <!--要计算scroll的高度 所以吧songs作为数据传进去-->
    <scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :songs="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import Loading from 'base/loading/loading'
import {prefixStyle} from 'common/js/dom'
import {mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  // 一个组件可以插入多个mixin 组件同名的方法可以覆盖mixin里面的方法
  mixins: [playlistMixin],
  // 可以接收的数据
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      // default: function () {
      //   return []
      // }
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted () {
    //  向下滚 +
    this.imageHeight = this.$refs.bgImage.clientHeight
    // 向上滚 -
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    // this.$refs.list viewcomponent对象  要取其dom 也就是element
    // scroll的top
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll (pos) {
      // 上滑为- 下滑为+
      this.scrollY = pos.y
    },
    back () {
      this.$router.back()
    },
    selectItem (item, index) {
      // 设置playlist sequencelist currentindex playstate fullScreen
      this.selectPlay({
        // 这个item是song 但是我们需要的是songs 所以这个item没有用
        // action调用之后，mutations改变，player里面的数据（playlist,fullScreen）就会改变
        list: this.songs,
        index
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ]),
    // 随机播放按钮
    random () {
      this.randomPlay({
        list: this.songs
      })
    }
  },
  watch: {
    scrollY (newY) {
      // 最远滚动的距离是 this.minTranslateY
      let translateY = Math.max(this.minTranslateY, newY)
      let zIndex = 0
      let scale = 1
      // 模糊度
      let blur = 0
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      // this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
      // // webkit兼容性
      // this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`
      const percent = Math.abs(newY / this.imageHeight)
      // 从原点往下拉 图片放大
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        // 最大是20模糊
        blur = Math.min(20 * percent, 20)
      }
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      // this.$refs.filter.style['backdrop-filter'] = `blur(${blur}px)`
      // this.$refs.filter.style['webkitBackdrop-filter'] = `blur(${blur}px)`
      this.$refs.bgImage.style[transform] = `scale(${scale})`
      // this.$refs.bgImage.style['transform'] = `scale(${scale})`
      // this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
      // newY - this.minTranslateY -  newY<this.minTranslateY 说明已经滚动到顶部了
      if (newY < this.minTranslateY) {
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        // 随机播放按钮消失
        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingTop = `70%`
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  components: {
    Scroll,
    SongList,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>

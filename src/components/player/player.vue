<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
     <div class="normal-player" v-show="fullScreen">
       <div class="background">
         <img width="100%" height="100%" :src="currentSong.image">
       </div>
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdCls">
              <img class="image" :src="currentSong.image">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
              <!--playingLyric首先在data里面定义-->
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
          <!--currentLyric不为null时 传入数据（目的是 当currentLyric.lines发生变化时，可以自动调用refresh方法）-->
        <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
                <div v-if="currentLyric">
                    <p ref="lyricLine" class="text" :class="{'current': currentLineNum === index}" v-for="(line, index) in currentLyric.lines" :key="line.id">{{line.txt}}</p>
                </div>
            </div>
        </scroll>
      </div>
      <div class="bottom">
          <div class="dot-wrapper">
              <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
              <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                  <!--监听percentChage事件-->
                  <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              </div>
              <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
        <div class="operators">
          <div class="icon i-left" @click="changeMode">
            <i :class="iconMode"></i>
          </div>
          <div class="icon i-left" :class="disableCls">
            <i class="icon-prev" @click="prev"></i>
          </div>
          <div class="icon i-center" :class="disableCls">
            <i @click="togglePlaying" :class="playIcon"></i>
          </div>
          <div class="icon i-right" :class="disableCls">
            <i class="icon-next" @click="next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon icon-not-favorite"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <transition name="mini">
     <div class="mini-player" v-show="!fullScreen" @click="open">
      <div class="icon">
        <div class="imgWrapper">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control">
          <progress-circle :radius="32" :percent="percent">
          <!--&lt;!&ndash;点击miniIcon，会冒泡到父元素，父元素也有一个点击事件，就会打开播放器 所以要click.stop阻止冒泡&ndash;&gt; slot-->
            <i :class="miniIcon" @click.stop="togglePlaying" class="icon-mini"></i>
          </progress-circle>
      </div>
      <div class="control" @click.stop="showPlaylist">
        <i class="icon-playlist"></i>
      </div>
    </div>
    </transition>
      <playlist ref="playlist"></playlist>
    <!--监听currentSong发生改变时，调用audio的play播放方法-->
      <!--歌曲到加载到播放，播放的时候会派发一个事件叫canplay,timeupdate-->
      <!--歌曲请求不到地址时，会派发error-->
      <!--歌曲结束的时候，能派发ended事件-->
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import ProgressBar from 'base/progress-bar/progress-bar'
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressCircle from 'base/progress-circle/progress-circle'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import {playerMixin} from 'common/js/mixin'
import {playMode} from 'common/js/config'

const transitionDuration = prefixStyle('transitionDuration')
const transform = prefixStyle('transform')

export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      // 当前歌词所在的行
      currentLineNum: 0,
      // 当前轮播页面
      currentShow: 'cd',
      // 在handleLyric调用显示
      playingLyric: ''
    }
  },
  created () {
    // 目的是在不同的回调函数里面共享数据 不需要getter setter(计算属性)
    this.touch = {}
  },
  computed: {
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    ...mapGetters([
      'fullScreen',
      // 'playlist',
      // 'currentSong',
      // 获取当前的playing状态
      'playing',
      'currentIndex'
      // 'mode',
      // 'sequenceList'
    ]),
    // 当向前向后按钮不能点击时，按钮类发生变化
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    // 歌曲播放比例
    percent () {
      return this.currentTime / this.currentSong.duration
    }
  },
  methods: {
    // 提交修改
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
      // setPlayingState: 'SET_PLAYING_STATE',
      // setCurrentIndex: 'SET_CURRENT_INDEX',
      // setPlayMode: 'SET_PLAY_MODE',
      // setPlaylist: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'savePlayHistory'
    ]),
    back () {
      this.setFullScreen(false)
    },
    // 点击我们的歌曲列表会提交一个action，此时commit(types.SET_PLAYING_STATE, TRUE)所以歌曲播放
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      // console.log(this.playing) 此处改变playing的值
      if (this.currentLyric) {
        // 注意是togglePlay() 不是togglePlaying()
        this.currentLyric.togglePlay()
      }
    },
    open () {
      this.setFullScreen(true)
    },
    // done执行的时候就会跳到下一个函数
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 动画执行完了之后就会调用done函数（回调函数）done函数执行之后，就会跳到afterEnter
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      // 清空animation
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      // 以mini小图片中心为原点 y以下为正 x以右为正，这里的 x,y表示移动的起点坐标，终点坐标是（0,0）
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      // 监听transitionend事件，这个事件执行完之后，执行done 然后执行afterLeave函数
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    showPlaylist () {
      this.$refs.playlist.show()
    },
    _getPosAndScale () {
      // mini播放器的小图片动画飞到上面的大图片(middle cd-wrapper)
      const targetWidth = 40
      // 中心坐标离左边40
      const paddingLeft = 40
      const paddingBottom = 80
      // 上面的大图片
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      // 初始的缩放比例
      const scale = targetWidth / width
      // 以大图片中心为原点 y以下为正 x以右为正，这里的 x,y表示移动的起点坐标，终点坐标是（0,0）
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    // <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error"></audio>
    // 切换太快容易报错,只有当我们的歌曲ready的时候，我们才能点击下一首歌
    prev () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      // this.$refs.audio.currentTime 是一个可读写的属性
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        // seek()方法，当歌曲单首循环播放结束时，歌词重新开始
        this.currentLyric.seek(0)
      }
    },
    next () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        // 顺序播放
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    // 当歌曲的URL有问题的时候， this.songReady = true就永远不能执行，功能就不能执行
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    // 歌曲加载失败，触发error函数
    error () {
      this.songReady = true
    },
    // 参数是event对象 target是audio标签 audio标签有一个currentTime属性 e.target.currentTime表示当前audio播放的一个时间
    updateTime (e) {
      // 这里是时间戳
      this.currentTime = e.target.currentTime
    },
    format (interval) {
      // 向下取整
      interval = interval | 0
      const minute = interval / 60 | 0
      // 这里second是一位数
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    // 补到几位 用0 去补位 n代表需要补到字符串的长度
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    onProgressBarChange (percent) {
      const currentTime = percent * this.currentSong.duration
      this.$refs.audio.currentTime = percent * this.currentSong.duration
      // 拖动到某时刻都播放
      if (!this.playing) {
        this.togglePlaying()
      }
      // 按钮移动时 歌词也跟着一起变
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 获取不到歌词的时候，需要进行一些清理操作  catch
    getLyric () {
      this.currentSong.getLyric().then((lyric) => {
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          // 歌曲播放时，播放歌词
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 当歌词的每一行发生改变的时候就发生回调一下  lyric-parser 那个库调用的，会传对应的参数,参数是固定的，本来就有的
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        // 为了歌词能保持在屏幕的中间
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        // 保持不动
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      // this.touch.startX this.touch.startY 都为+
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      // 这里获取 x y坐标原因：当y轴偏移>x轴偏移，这时应该页面上下滚动而不是左右滚动
      // this.touch.startX this.touch.startY和middleTouchStart()函数中的是一样的
      // 从唱片到歌词 从右向左滑 touch.pageX > 0 减少
      // x轴向右为+ y轴向下为+
      // deltaX deltaY 为+
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 只支持横向滚动 此时认为是纵向滚动 什么都不做
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      // 滑动的比例
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      // 修改middleL的透明度 this.touch.percent越大 ，opacity越小
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd () {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 此时this.currentShow = 'lyric',从右向左滑，this.touch.percent是从1到0
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      // move的时候要把时间设为0
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      // 修改middleL的透明度
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    }
  },
  watch: {
    // 如果歌曲在微信中播放，歌曲到后台了，微信不支持js，audio是可以把当前这首歌播放完的。当前这首歌播放完了之后，
    // 就会触发end函数。但是end js函数不执行。，然后就切换不了。this.$refs.audio.play()可以延时时间更长一些
    // 解决在微信在使用它从后台切到前台，js执行的时候，保证播放器可以正常播放
    currentSong (newSong, oldSong) {
    // <audio ref="audio" :src="currentSong.url"></audio>
    //   加延时，播放的时候，同时请求currentSong.url会报错
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      // 连续切换几首歌的时候，歌词高亮会乱跳，切换歌曲的时候，currentLyric的定时器没有清理，重新getLyric之前，要把当前的给释放掉
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      // this.$nextTick(() => {
      //   this.$refs.audio.play()
      //   this.getLyric()
      // })
      setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    // mutation一旦触发了以后，就会触发watch，就会  newPlaying ? audio.play() : audio.pause() 所以也要加延迟
    playing (newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>

<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!--加prevent阻止默认行为-->
      <div class="progress-btn-wrapper" ref="progressBtn"
      @touchstart.prevent="progressTouchStart"
      @touchmove.prevent="progressTouchMove"
      @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {prefixStyle} from 'common/js/dom'

const progressBtnWidth = 16
const transform = prefixStyle('transform')
export default {
  // 接收百分比
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    // 目的是在不同的回调函数里面共享数据 不需要getter setter(计算属性)
    this.touch = {}
  },
  methods: {
    progressTouchStart (e) {
      // 初始化
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      // （已进行）进度条
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      // 移动的距离
      const deltaX = e.touches[0].pageX - this.touch.startX
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
      this._offset(offsetWidth)
    },
    progressTouchEnd () {
      this.touch.initiated = false
      // 触发一个方法
      this._triggerPercent()
    },
    _triggerPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      // 把percent派发出去
      this.$emit('percentChange', percent)
    },
    _offset (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    },
    // 点击到某处 切换到某处
    progressClick (e) {
      // rect是进度条最左边到屏幕最左边框的距离
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // 用下面这个方法，点击进度条progressBtn时，e.offsetX获取不对 进度会切换至0
      // this._offset(e.offsetX)
      this._triggerPercent()
    }
  },
  watch: {
    // percent是从外面传入的 是不断改变的
    percent (newPercent) {
      // !this.touch.initiated 没有在拖动的过程中
      if (newPercent >= 0 && !this.touch.initiated) {
        // 要减去进度按钮小球的宽度progress-btn 16
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        // 偏移宽度
        const offsetWidth = newPercent * barWidth
        this._offset(offsetWidth)
      }
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

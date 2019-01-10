<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
export default {
  props: {
    probeType: {
      type: Number,
      default: 1
    },
    click: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: null
    },
    // scroll要不要监听滚动事件
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 是否开启上拉刷新 如果需要上拉刷新 ，就把这个值传为true
    pullup: {
      type: Boolean,
      default: false
    },
    // better-scroll在滚动一开始会派发beforeScrollstart事件
    beforeScroll: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    _initScroll () {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      if (this.listenScroll) {
        let me = this
        this.scroll.on('scroll', (pos) => {
          me.$emit('scroll', pos)
        })
      }
      if (this.pullup) {
        // 滚动结束，有且仅派发一次scrollEnd回调函数事件,
        this.scroll.on('scrollEnd', () => {
          // console.log(this.scroll.y) 起点为0 y轴以上为正方向 此时都是负值
          // console.log(this.scroll.maxScrollY)   当perpage=20 为-294
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            // 滚动到底部scrollToEnd事件，派发scrollToEnd事件
            this.$emit('scrollToEnd')
          }
        })
      }
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          // 对外派发一个事件 通过scroll传到suggest 然后传到search
          this.$emit('beforeScroll')
        })
      }
    },
    // 代理别的方法 this.scroll指向better-scroll的实例
    enable () {
      this.scroll && this.scroll.enabled()
    },
    disable () {
      this.scroll && this.scroll.disable()
    },
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    scrollTo () {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  // data数据变化 重新计算方法
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
      }, 20)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

</style>

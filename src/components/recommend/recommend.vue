<template>
<div class="recommend" ref="recommend">
    <!--scroll监听到discList数据变化 然后重新计算 获取到recommends的数据比discList数据要早，此时轮播图dom已经被撑开，所以scroll里面传入的数据是discList-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
        <!--better-scroll作用域是父（recommend-content）子集，子集只有第一个元素才会滚动-->
        <div>
            <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
                <slider>
                    <div v-for="item in recommends" :key="item.id">
                        <a v-bind:href="item.linkUrl">
                            <!--监听onload事件,刷新scroll组件，否则当轮播图没有刷新出来时，scroll就已经初始化了，
                            如果轮播图再出来之后，scroll的长度没有增加，导致我们不能看到全部列表-->
                            <!--class="needsclick" 解决fastclick冲突，实现slider点击事件 需要点击（needsclick）-->
                            <img class="needsclick" @load="loadImage" v-bind:src="item.picUrl"/>
                        </a>
                    </div>
                </slider>
            </div>
            <div class="recommend-list">
                <h1 class="list-title">热门歌单推荐</h1>
                <ul>
                    <li @click="selectItem(item)" v-for="item in discList" :key="item.dissid" class="item">
                        <div class="icon">
                            <!--<img width="60" height="60" :src="item.imgurl" >-->
                            <img width="60" height="60" v-lazy="item.imgurl" >
                        </div>
                        <div class="text">
                            <!--v-html可以对字符进行转义-->
                            <h2 class="name" v-html="item.creator.name"></h2>
                            <p class="desc" v-html="item.dissname"></p>
                        </div>
                    </li>
                </ul>
            </div>
            <ul></ul>
        </div>
        <div class="loading-container" v-show="!discList.length">
            <loading></loading>
        </div>
    </scroll>
    <router-view></router-view>
</div>
</template>

<script type="text/ecmascript-6">
import Loading from 'base/loading/loading'
import Scroll from 'base/scroll/scroll'
import Slider from 'base/slider/slider'
import {getRecommend, getDiscList} from 'api/recommend'
import {ERR_OK} from 'api/config'
import {playlistMixin} from 'common/js/mixin'
import {mapMutations} from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  created () {
    this._getRecommend()
    // setTimeout(() => {
    this._getDiscList()
    // }, 1000)
  },
  methods: {
    // 当点击列表的时候，把vuex数据写进去，切到disc组件的时候，在从vuex把数据拿出来，实现路由之间数据通讯的功能
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      // 这样就能更改state里面的disc{}，然后disc.vue里面就可以接收这个数据
      this.setDisc(item)
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    _getRecommend () {
      // 因为getRecommend()是Promise所以用then获取数据
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data.slider)
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList () {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data)
          this.discList = res.data.list
        } else {
          console.log('1')
        }
      })
    },
    loadImage () {
      // 只要有一个img调用就行了 slider被撑开 scroll高度包括slider+歌词部分
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    Slider, Scroll, Loading
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    .recommend
        position: fixed
        width: 100%
        top: 88px
        bottom: 0
        .recommend-content
            height: 100%
            overflow: hidden
            .slider-wrapper
                position: relative
                width: 100%
                overflow: hidden
            .recommend-list
                .list-title
                    height: 65px
                    line-height: 65px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-theme
                .item
                    display: flex
                    box-sizing: border-box
                    align-items: center
                    padding: 0 20px 20px 20px
                    .icon
                        flex: 0 0 60px
                        width: 60px
                        padding-right: 20px
                    .text
                        display: flex
                        flex-direction: column
                        justify-content: center
                        flex: 1
                        line-height: 20px
                        overflow: hidden
                        font-size: $font-size-medium
                        .name
                            margin-bottom: 10px
                            color: $color-text
                        .desc
                            color: $color-text-d
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>

<template>
    <!--scroll组件要把数据传进去-->
    <scroll class="suggest" :data="result" :pullup="pullup" @scrollToEnd="searchMore" :beforeScroll="beforeScroll" @beforeScroll="listScroll" ref="suggest">
        <ul class="suggest-list">
            <li @click="selectItem(item)" class="suggest-item" v-for="item in result" :key="item.song">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
        <!--no-result-wrapper这个div主要是让内部的no-result组件垂直居中-->
        <div v-show="!hasMore && !result.length" class="no-result-wrapper">
            <!--若title传动态值-->
            <!--<no-result :title="datawww"></no-result>-->
            <no-result title="抱歉，暂无搜索结果"></no-result>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
import {search} from 'api/search'
import {ERR_OK} from 'api/config'
import {createSong, processSongsUrl, isValidMusic} from 'common/js/song'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import NoResult from 'base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 30
export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    // 是否显示歌手
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1,
      result: [],
      pullup: true,
      // 判断检索数据有没有加载完 true为没有加载完
      hasMore: true,
      beforeScroll: true
    }
  },
  methods: {
    refresh () {
      this.$refs.suggest.refresh()
    },
    // 请求服务端的逻辑封装到一个方法里面 请求服务端 抓取我们的检索数据
    search () {
      this.page = 1
      this.hasMore = true
      // 当我们的检索关键字变化的时候 我们要实时把scroll滚动到顶部
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          // this.result = this._genResult(res.data)
          this._genResult(res.data).then((result) => {
            this.result = result
          })
          this._checkMore(res.data)
        }
      })
    },
    listScroll () {
      // 继续派发事件
      this.$emit('listScroll')
    },
    _checkMore (data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
        this.hasMore = false
      }
    },
    searchMore () {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          // 不能直接调用下面的 而是进行数组的拼接
          // this.result = this.result.concat(this._genResult(res.data))
          this._genResult(res.data).then((result) => {
            this.result = this.result.concat(result)
          })
          this._checkMore(res.data)
        }
      })
    },
    selectItem (item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.id}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      // suggest这个组件本身不包含存储播放历史的，所以父组件监听这里派发的select事件
      this.$emit('select')
    },
    _genResult (data) {
      let ret = []
      // 第一个item是歌手信息
      // 1、若没有歌手 zhida数据结构 即没有zhida.singerid
      // zhida: {
      //   type: 0
      // }
      if (data.zhida && data.zhida.singerid) {
        // ...data.zhida data.zhida的所有对象 type用来区分这条数据是歌曲还是歌手用的
        //   var arr = [1,2,3] foo(arr[0],arr[1],arr[2]) foo(...arr)
        // 2、有歌手信息 data.zhida 数据结构 因为最后面是...{type: TYPE_SINGER} 这里直接取代下面的type，若此时不是type，则数据跟在这个数据结构的最后
        // ...{type: TYPE_SINGER} 用来区分这个是歌曲还是歌手用  见getIconCls (item)
        // albumnum: 5
        // singerid: 89754
        // singermid: "000s4sRS1w10Hm"
        // singername: "S"
        // songnum: 60
        // type: 2
        ret.push({...data.zhida, ...{type: TYPE_SINGER}})
      }
      // if (data.song) {
      //   ret = ret.concat(this._normalizeSongs(data.song.list))
      // }
      return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
        ret = ret.concat(songs)
        return ret
      })
    },
    getIconCls (item) {
      // 歌曲的时候item.type = 0 歌手item.type = singer
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName (item) {
      // 第一个item是歌手信息
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        // filterSinger(item.singer) 求item.singer.name
        return `${item.name}-${item.singer}`
      }
    },
    _normalizeSongs (list) {
      // 以song实例为item的一个数组
      let ret = []
      list.forEach((musicData) => {
        // if (musicData.songid && musicData.albumid) {
        //   ret.push(createSong(musicData))
        // }
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query () {
      // query通过props传进来的，可以通过this.props访问
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    .suggest
        height: 100%
        overflow: hidden
        .suggest-list
            padding: 0 30px
            .suggest-item
                display: flex
                align-items: center
                padding-bottom: 20px
            .icon
                flex: 0 0 30px
                width: 30px
                [class^="icon-"]
                    font-size: 14px
                    color: $color-text-d
            .name
                flex: 1
                font-size: $font-size-medium
                color: $color-text-d
                overflow: hidden
                .text
                    no-wrap()
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>

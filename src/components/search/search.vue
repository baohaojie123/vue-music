<template>
   <div class="search">
     <div class="search-box-wrapper">
       <search-box ref="searchBox" @query="onQueryChange"></search-box>
     </div>
     <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query" >
       <!--scroll组件只能根据第一个子元素的高度来确定滚不滚动 所以在hot-key search-history外面加了一个div-->
       <!--这里的hotKey和searchHistory需要异步获取，此时scroll不能滚动 所以scroll传值比较关键 ，根据scroll传data的变化，重新计算scroll的高度-->
       <!--但是这里又有hotKey 又有searchHistory，传哪个都不行，这里采用计算属性-->
       <!--给scroll里有search-list的加refreshDelay-->
       <scroll ref="shortcut" class="shortcut" :data="shortcut" :refreshDelay="refreshDelay">
         <div>
           <div class="hot-key">
             <h1 class="title">热门搜索</h1>
             <ul>
               <li @click="addQuery(item.k)" class="item" v-for="item in hotKey" :key="item.n">
                 <span>{{item.k}}</span>
               </li>
             </ul>
           </div>
           <div class="search-history" v-show="searchHistory.length">
             <h1 class="title">
               <span class="text">搜索历史</span>
               <!--<span class="clear" @click="deleteAll">-->
               <!--<span class="clear" @click="clearSearchHistory">-->
               <!--添加confirm-->
               <span class="clear" @click="showConfirm">
               <i class="icon-clear"></i>
             </span>
             </h1>
             <!--参数是在执行这个函数的时候传入的，在模板中不写的话就是事件默认派发的参数，自定义事件的话默认派发的就是 $emit 传入的参数。-->
             <!--<search-list @select="addQuery" :searches="searchHistory" @delete="deleteOne"></search-list>-->
             <search-list @select="addQuery" :searches="searchHistory" @delete="deleteSearchHistory"></search-list>
           </div>
         </div>
       </scroll>
     </div>
       <div ref="searchResult" class="search-result" v-show="query">
           <suggest ref="suggest" @select="saveSearch" @listScroll="blurInput" :query="query"></suggest>
       </div>
     <!--把confirm放在内层而不是放在最外层都公用的原因-->
     <!--①每个confirm都是独立的，每个事件、回调都是独立开来，没有任何冲突-->
     <!--②其次，confirm与外层的控制有紧密关联的，外层可以调用confirm的一些方法，来控制confirm的显示和隐藏-->
     <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
     <router-view></router-view>
   </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import {getHotKey} from 'api/search'
import {ERR_OK} from 'api/config'
import Suggest from 'components/suggest/suggest'
import {mapActions} from 'vuex'
import SearchList from 'base/search-list/search-list'
import {playlistMixin, searchMixin} from 'common/js/mixin'

export default {
  mixins: [playlistMixin, searchMixin],
  created () {
    this._getHotKey()
  },
  data () {
    return {
      hotKey: [],
      query: ''
    }
  },
  computed: {
    shortcut () {
      // hotKey searchHistory有一个发生改变的时候，shortcut就会重新计算
      return this.hotKey.concat(this.searchHistory)
    }
    // ['searchHistory']这个是个数组，得到数据渲染到dom中
    // ...mapGetters([
    //   'searchHistory'
    // ])
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    _getHotKey () {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          // 截取前十个数据
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    // addQuery (query) {
    //   // 把query设置进去
    //   this.$refs.searchBox.setQuery(query)
    // },
    // query从搜索框里面拿到变化值 然后传到sugguest组件query
    // onQueryChange (query) {
    //   this.query = query
    // },
    // 把search-box里面的input给blur（移开焦点）了 search是searbox的父组件，就可以调用子组件的方法,最终实现滚动之前，手机键盘收起的功能
    // blurInput () {
    //   this.$refs.searchBox.blur()
    // },
    // 保存搜索结果 如果这里的历史只需保存在组件中，则只需要调用mutation就可以。但是如果要保存到localStorage,实现永久保存，这里我们就需要封装一个action
    // saveSearch () {
    //   this.saveSearchHistory(this.query)
    // },
    deleteOne (item) {
      this.deleteSearchHistory(item)
    },
    // deleteAll () {
    //   this.clearSearchHistory()
    // },
    showConfirm () {
      this.$refs.confirm.show()
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ])
  },
  watch: {
    // 监听query，解决当搜索历史item刚要超出屏幕时，不会滚动的问题
    query (newQuery) {
      // 当从suggest搜索列表切到search主页的时候，query的是从有到无的变化
      if (!newQuery) {
        let that = this
        setTimeout(() => {
          that.$refs.shortcut.refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>

<template>
  <div id="app">
    <m-header></m-header>
      <tab></tab>
    <!--keep-alive把dom都缓存到内存中，切换tab时不需要重新请求数据-->
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
      <!--切换路由不会影响播放器的播放-->
      <player></player>
  </div>
</template>
<script type="text/ecmascript-6">
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'
export default {
  components: {
    MHeader, Tab, Player
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
</style>

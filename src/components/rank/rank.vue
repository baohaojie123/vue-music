<template>
    <div>
        排行页面
        <input v-model="example0">
        <input v-model="example1">
        <input v-model="example2.inner0">
    </div>
</template>

<script type="text/ecmascript-6">
export default {
  data () {
    return {
      example0: '',
      example1: '',
      example2: {
        inner0: 1,
        inner1: 2
      }
    }
  },
  watch: {
    example0 (curVal, oldVal) {
      // console.log(curVal, oldVal)
      console.log(curVal)
      console.log(oldVal)
    },
    example1: 'a',
    example2: {
      handler (curVal, oldVal) {
        console.log(curVal, oldVal)
      },
      deep: true
    }
  },
  methods: {
    a (curVal, oldVal) {
      console.log(curVal, oldVal)
    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">

</style>

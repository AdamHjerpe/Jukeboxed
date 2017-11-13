<template>
  <div id="app">
    <topbar />
    <wrapper />
  </div>
</template>

<script>
  import topbar from './js/app/modules/topbar'
  import wrapper from './js/app/modules/wrapper'

  export default {
    components: {
      topbar,
      wrapper
    }
  }
</script>

<style lang="scss">
  @import './scss/style.scss';
</style>

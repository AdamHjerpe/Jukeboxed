<template>
  
  <div class="topbar">
    <logo />
    <topmenu />
  </div>

</template>

<script>
  import logo from './../components/topbar/logo'
  import topmenu from './../components/topbar/menu'

  export default {
    components: {
      logo,
      topmenu
    }
  }
</script>
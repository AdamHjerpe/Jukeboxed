<template>
  
  <div class="search">
    <input
      type="text"
      v-model="searchInput"
      placeholder="Search for track or artist" />

    {{ searchInput }}
  </div>

</template>

<script>
  export default {
    data() {
      return {
        searchInput: ''
      }
    }
  }
</script>
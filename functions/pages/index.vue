<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-text-field v-model="url" label="URL to search" />
    <v-btn
      color="primary"
      nuxt
      :to="linkUrl"
    >
      Continue
    </v-btn>
  </v-layout>
</template>
<script>
export default {
  data: () => ({
    url: ''
  }),
  computed: {
    linkUrl () {
      return `/url/${encodeURIComponent(this.url)}`
    }
  }
}

</script>
<style lang="scss">
  v-spacer{ display: none}
</style>

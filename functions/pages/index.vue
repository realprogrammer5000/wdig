<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-form @submit.prevent="submit">
      <v-text-field v-model="url" type="url" :rules="[validate]" label="URL to search" />
      <v-btn
        ref="submitBtn"
        color="primary"
        nuxt
        :to="linkUrl"
        type="submit"
      >
        Continue
      </v-btn>
    </v-form>
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
  },
  methods: {
    submit () {
      this.$router.push({
        path: this.linkUrl
      })
    },
    validate: (url) => {
      try {
        // eslint-disable-next-line no-new
        new URL(url)
        return true
      } catch (e) {
        return 'Invalid URL'
      }
    }
  }
}

</script>
<style lang="scss">
  v-spacer{ display: none}
</style>

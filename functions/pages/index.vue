<template>
  <v-form ref="form" @submit.prevent="submit">
    <!--suppress HtmlUnknownBooleanAttribute -->
    <v-layout
      column
      justify-center
      align-center
    >
      <v-text-field
        v-model="url"
        autofocus
        validate-on-blur
        type="url"
        :rules="[validate]"
        label="URL to search"
      />
      <v-btn
        ref="submitBtn"
        color="primary"
        nuxt
        :to="linkUrl"
        type="submit"
      >
        Continue
      </v-btn>
    </v-layout>
  </v-form>
</template>
<script>
export default {
  data: () => ({
    url: ''
  }),
  computed: {
    linkUrl () {
      return `/lookup?url=${encodeURIComponent(this.url)}`
    }
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.$router.push({
          path: this.linkUrl
        })
      }
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
  },
  head: () => ({
    title: 'Where Does It Go?',
    titleTemplate: null
  })
}
</script>

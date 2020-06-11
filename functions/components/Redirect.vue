<template>
  <v-card outlined>
    <v-card-title>Redirect</v-card-title>
    <v-card-text>This page redirects to <a :href="to">{{ to }}</a></v-card-text>
  </v-card>
</template>
<style>

</style>
<script>
export default {
  props: {
    to: {
      required: true,
      type: String
    }
  }
}
</script>

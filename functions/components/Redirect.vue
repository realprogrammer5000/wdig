<template>
  <v-card outlined>
    <v-card-title>Redirect</v-card-title>
    <v-card-text>This page redirects to <a :href="to">{{ to }}</a></v-card-text>
  </v-card>
</template>
<script>
// noinspection JSUnusedGlobalSymbols
export default {
  props: {
    to: {
      required: true,
      type: String
    }
  }
}
</script>

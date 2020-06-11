<template>
  <v-card class="error" outlined>
    <v-card-title>Warning</v-card-title>
    <v-card-text>
      <span v-if="analysis === 'rickroll'">The page is likely a rickroll.</span>
      <span v-else-if="analysis === 'safebrowsing'">The page was flagged as an unsafe site by <a href="https://safebrowsing.google.com/">Google Safe Browsing</a></span>
      <span v-else>An unknown warning was raised: {{ analysis }}</span>
    </v-card-text>
  </v-card>
</template>
<script>
// noinspection JSUnusedGlobalSymbols
export default {
  props: {
    analysis: {
      required: true,
      type: String
    }
  }
}
</script>

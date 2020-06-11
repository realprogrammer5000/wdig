<template>
  <v-card outlined>
    <v-img :alt="'screenshot of ' + pageUrl" :src="imageUrl" />
    <v-card-text>Screenshot of <a :href="pageUrl">{{ pageUrl }}</a></v-card-text>
  </v-card>
</template>
<script>
export default {
  props: {
    imageUrl: {
      required: true,
      type: String
    },
    pageUrl: {
      required: true,
      type: String
    }
  }
}
</script>

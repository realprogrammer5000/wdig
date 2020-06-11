<template>
  <div>
    <h1>WDIG Lookup</h1>
    <a :href="this.$route.params.id">{{ this.$route.params.id }}</a>
    <div v-if="$fetchState.pending">
      <v-skeleton-loader class="card-placeholder" type="image" />
      <!--      <v-skeleton-loader type="text"></v-skeleton-loader>-->
      <v-skeleton-loader class="card-placeholder" type="image" />
    </div>
    <!-- eslint-disable-next-line vue/require-v-for-key   -->
    <div v-for="result in results" v-else class="result">
      <redirect v-if="result.type === 'redirect'" :to="result.to" />
      <analysis v-for="analysis in result.analysis" v-else-if="result.type === 'analysis'" :key="analysis" :analysis="analysis" />
      <screenshot v-else-if="result.type === 'screenshot'" :image-url="result.dataUri" :page-url="result.url" />
    </div>
  </div>
</template>
<style scoped lang="scss">
  .card-placeholder {
    height: 102px;
  }
  .result, .card-placeholder {
    margin: 1em auto;
  }
</style>
<script>
import Redirect from '~/components/Redirect.vue'
import Analysis from '~/components/Analysis.vue'
import Screenshot from '~/components/Screenshot.vue'

// adapted from example 2 of https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read
async function* readBodyLineByLine (body) {
  const utf8Decoder = new TextDecoder('utf-8')
  const reader = body.getReader()
  let { value: chunk, done: readerDone } = await reader.read()
  chunk = chunk ? utf8Decoder.decode(chunk) : ''

  const re = /\r\n|\n|\r/gm
  let startIndex = 0

  for (; ;) {
    const result = re.exec(chunk)
    if (!result) {
      if (readerDone) {
        break
      }
      const remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read())
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '')
      startIndex = re.lastIndex = 0
      continue
    }
    yield chunk.substring(startIndex, result.index)
    startIndex = re.lastIndex
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex)
  }
}

export default {
  components: {
    Redirect,
    Analysis,
    Screenshot
  },
  async fetch () {
    const { context: { params, error, env } } = this.$nuxt
    const decodedUrl = decodeURIComponent(params.id)
    const url = new URL(decodedUrl)
    this.url = decodedUrl
    if (!url.href.startsWith('http://') && !url.href.startsWith('https://')) { throw new Error('Invalid protocol') }
    const apiReq = await fetch(`${env.apiUrl}/lookup/?url=${encodeURIComponent(params.id)}`)
    if (!apiReq.ok) { return error({ statusCode: apiReq.status, message: 'An error occurred' }) }

    if (process.client) {
      (async () => {
        for await (const line of readBodyLineByLine(apiReq.body)) {
          this.results.push(JSON.parse(line))
        }
      })()
    } else {
      // each result is a JSON object delimited by a newline
      const responseLines = await apiReq.text()
      this.results = responseLines.split('\n').map(line => JSON.parse(line))
    }
  },
  data: () => {
    return {
      results: [],
      url: ''
    }
  },
  head () {
    return { title: this.url }
  }
}
</script>

<template>
  <div>
    <div>{{ this.$route.params.id }} {{ results }}</div>
    <!-- eslint-disable-next-line vue/require-v-for-key   -->
    <div v-for="result in results">
      {{ result.type }}
    </div>
  </div>
</template>

<script>
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
  async asyncData ({ params, error, env, req }) {
    console.log(`${env.apiUrl}/lookup/${encodeURIComponent(params.id)}`)
    const url = new URL(decodeURIComponent(params.id))
    if (!url.href.startsWith('http://') && !url.href.startsWith('https://')) { throw new Error('Invalid protocol') }
    const apiReq = await fetch(`${env.apiUrl}/lookup/${encodeURIComponent(params.id)}`)
    if (!apiReq.ok) { return error({ statusCode: apiReq.status, message: 'An error occured' }) }

    if (process.client) {
      const results = []
      const apiReq = await fetch(`${$nuxt.context.env.apiUrl}/lookup/${encodeURIComponent($nuxt.context.params.id)}`)

      if (!apiReq.ok) {
        return $nuxt.error({ statusCode: apiReq.status, message: 'An error occured' })
      }

      for await (const line of readBodyLineByLine(apiReq.body)) {
        results.push(JSON.parse(line))
      }
      return { results }
    } else {
      // each result is a JSON object delimited by a newline
      const responseLines = await apiReq.text()
      return {
        results: responseLines.split('\n').map(line => JSON.parse(line))
      }
    }
  }
}
</script>

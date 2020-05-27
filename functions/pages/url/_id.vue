<template>
  <p>{{ this.$route.params.id }} {{ results }}</p>
</template>

<script>
export default {
  async asyncData ({ params, error, env }) {
    const url = new URL(decodeURIComponent(params.id))
    if (!url.href.startsWith('http://') && !url.href.startsWith('https://')) { throw new Error('Invalid protocol') }
    const req = await fetch(`${env.apiUrl}/lookup/${encodeURIComponent(params.id)}`)
    const data = await req.json()
    if (!req.ok) { return error({ statusCode: req.status, message: data.error }) }
    return data
  }
}
</script>

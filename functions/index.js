const functions = require('firebase-functions')
const { Nuxt } = require('nuxt')
const express = require('express')

const nuxtApp = express()

const config = {
  dev: false
}

const nuxt = new Nuxt(config)

let isReady = false
const readyPromise = nuxt
  .ready()
  .then(() => {
    isReady = true
  })
  .catch(() => {
    process.exit(1)
  })

async function handleRequest (req, res) {
  if (!isReady) {
    await readyPromise
  }
  res.set('Cache-Control', 'public, max-age=1, s-maxage=1')
  await nuxt.render(req, res)
}

nuxtApp.all('*', handleRequest)
nuxtApp.use(handleRequest)
exports.nuxt = functions.https.onRequest(nuxtApp)

// apiApp.get()
exports.api = functions.https.runWith({
  memory: '512MB'
}).onRequest(require('./api'))

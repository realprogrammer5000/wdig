const express = require('express')
const app = express()
const cors = require('cors')
const puppeteer = require('puppeteer')
let browser

app.use(cors())

app.get('/lookup/:url', (req, res) => {
  if (req.params.url.includes('err')) {
    res.status(404).json({
      results: [],
      error: 'Not found'
    })
  } else {
    res.json({
      results: [
        {
          path: req.params.url
        }
      ]
    })
  }
})

app.get('/', (req, res) => {
  res.status(200).end('Hello, World')
})

const sleep = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

app.get('/pptr', async (req, res) => {
  if (!browser) {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  }

  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(10000)
  page.on('load', () => console.log('load', page.url()))
  page.on('domcontentloaded', () => console.log('domcontentloaded'))
  // const prom = page.goto('http://httpbin.org/redirect-to?url=https://httpbin.org/get')
  page.goto('http://v.ht/toast')
  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
  } catch (e) {
    console.log(e)
  }

  console.log('navigated')

  await sleep(500)

  res.status(200).send(await page.content())
  await page.close()
})

module.exports = app

if (require.main === module) {
  app.listen(3001)
}

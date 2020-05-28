const express = require('express')
const app = express()
const cors = require('cors')
const puppeteer = require('puppeteer')

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

app.get('/pptr', async (req, res) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://example.com')
  res.status(200).end(await page.title())
  await browser.close()
})

module.exports = app

if (require.main === module) {
  app.listen(3001)
}

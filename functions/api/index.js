/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const express = require('express')
const app = express()
const puppeteer = require('puppeteer')
const lookup = require('safe-browse-url-lookup')({ apiKey: fs.readFileSync(path.join(__dirname, 'apikey')).toString().trim() })

let browser

app.use(cors())

app.get('/', (req, res) => {
  res.status(200).end('Hello, World')
})

const sleep = ms => new Promise(resolve => setTimeout(() => resolve(), ms))

const analyseUrl = async (rawUrl) => {
  const results = []
  const url = new URL(rawUrl)
  let hostname = url.hostname
  if (hostname.endsWith('.')) { hostname = hostname.slice(0, -1) }
  if (hostname.endsWith('.latlmes.com') || hostname === 'latlmes.com') { results.push('rickroll') }
  if (url.hostname.endsWith('.youtube.com') && url.pathname.startsWith('/watch')) {
    const video = url.searchParams.get('v')
    if ('dQw4w9WgXcQ,j5a0jTc9S10,dPmZqsQNzGA,EE-xtCF3T94,V-_O7nl0Ii0,xfr64zoBTAQ,Uj1ykZWtPYI,ID_L0aGI9bg,REWyCy_m39Q,nHRbZW097Uk,nQGsT44rVjk,VSa2IqDwnQ8,kJmKBhYsJho,Dh-CW22axyY,0EY98EsPXs8,-lmhJOhQHWc,3KANI2dpXLw,06pBzAlItwI,cH1NLToRz_o,gidHrKbTpog,0Z0i-nimHkU,OYpwAtnywTk,fZi4JxbTwPo,BXuxOeg6PiQ,6RyOsIseJbk,klqi_h9FElc,ObUZAcLgDn8,Eg7XtrH0duI,iQAAZX1gxvo,y6120QOlsfU,0SoNH07Slj0,cqF6M25kqq4,s99hC5WUwjo,lHyeAtiiL18,fMnIpIMuBJI,vkbQmH5MPME,QdNEtVH9bZE,PibwQR9nRus,d4N5LnsNpF0,DIs7dtlMCP0,Q53-mWHvxJo,cAN30xJp2Cs,_sWG4uhLiWo,KXPP2XDYpjQ,8O_ifyIIrN4,SWejvNI7WlM,N3MKlU5_Gs0,kczWpSN6emg,JU7jgF_dktI'.split(',').includes(video)) { results.push('rickroll') }
  }

  try {
    if (await lookup.checkSingle(rawUrl)) { results.push('safebrowsing') }
  } catch (e) {
    console.error(e)
  }

  return results
}

app.get('/lookup/', async (req, res) => {
  const errors = []
  let page
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      })
    }

    page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36')
    await page.setDefaultNavigationTimeout(2000)
  } catch (e) {
    console.error(e)
    return res.status(500).end('Internal server error')
  }

  const originalUrl = req.query.url
  if (typeof originalUrl !== 'string' || originalUrl.length < 0 || originalUrl.length > 50000) {
    return res.status(400).end('Invalid URL')
  }

  try {
    // eslint-disable-next-line no-new
    new URL(originalUrl)
  } catch (e) {
    console.error(e)
    return res.status(400).end('Invalid URL')
  }

  res.status(200).setHeader('Content-Type', 'application/json')

  page.on('load', () => {
    const url = page.url()
    if ((new URL(originalUrl)).href !== (new URL(url)).href) {
    // if (!hasFinished) {
      res.write(JSON.stringify({ type: 'redirect', to: url }) + '\n')
      console.log('url', url)
    }
  })
  try {
    await page.goto(originalUrl)
  } catch (e) {
    if (e.message.startsWith('net::ERR_TOO_MANY_REDIRECTS ')) {
      errors.push('TOO_MANY_REDIRECTS')
    } else if (e.message.startsWith('net::ERR_ABORTED ')) {
      errors.push('ABORTED')
    } else {
      console.error('page load error', e.message)
    }
  }

  console.log('page loaded')

  await sleep(1500)

  const finalUrl = await page.url()
  res.write(JSON.stringify({ type: 'analysis', analysis: await analyseUrl(finalUrl) }) + '\n')
  if (page.url().startsWith('chrome-error://')) {
    res.send({ failed: true })
  } else {
    const dataUri = `data:image/png;base64,${await page.screenshot({ encoding: 'base64' })}`
    res.write(JSON.stringify({ type: 'screenshot', dataUri, url: await page.url(finalUrl) }))
    res.end()
  }
  // const buffer = await page.screenshot()
  await page.close()
  console.log(errors)
})

module.exports = app

if (require.main === module) {
  app.listen(3001)
}

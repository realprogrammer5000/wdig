const express = require('express')
const app = express()
const cors = require('cors')

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

module.exports = app

if (require.main === module) {
  app.listen(3001)
}

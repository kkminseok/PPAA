const https = require('https')
const url = require('url')

module.exports = (req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const params = new URLSearchParams(parsedUrl.query)
  const queryString = params.toString()
  const targetPath = `/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev${queryString ? '?' + queryString : ''}`

  const proxyReq = https.request(
    { hostname: 'apis.data.go.kr', path: targetPath, method: 'GET' },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      })
      proxyRes.pipe(res)
    }
  )

  proxyReq.on('error', (err) => {
    res.writeHead(500)
    res.end(err.message)
  })

  proxyReq.end()
}

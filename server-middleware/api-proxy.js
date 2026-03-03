const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = createProxyMiddleware({
  target: 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  secure: false,
})

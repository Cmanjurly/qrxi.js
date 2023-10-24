const http = require('http');
const https = require('https');
const { URL } = require('url');

const server = http.createServer((req, res) => {
  const targetUrl = new URL(req.url.slice(1)); // Remove the leading slash

  const requestOptions = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = (targetUrl.protocol === 'https:' ? https : http).request(requestOptions, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Proxy Error');
  });

  req.pipe(proxyReq);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Try PORT first, then SERVER_PORT, then default to 3000
const port = parseInt(process.env.PORT || process.env.SERVER_PORT || '3000', 10);
const hostname = '0.0.0.0';

console.log(`Starting server on port ${port} (Source: ${process.env.PORT ? 'PORT' : process.env.SERVER_PORT ? 'SERVER_PORT' : 'Default'})`);

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      throw err;
    }
    console.log(`> Bin Rabie CRM successfully running on http://${hostname}:${port}`);
  });
});

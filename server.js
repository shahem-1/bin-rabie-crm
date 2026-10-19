const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = '0.0.0.0';

console.log(`Starting server on port ${port}, env PORT=${process.env.PORT}, SERVER_PORT=${process.env.SERVER_PORT}`);

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

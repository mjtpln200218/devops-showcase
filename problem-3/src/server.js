const http = require('node:http');

const portValue = process.env.APP_PORT;

if (!portValue) {
  console.error('APP_PORT is required');
  process.exit(1);
}

const port = Number(portValue);
const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});

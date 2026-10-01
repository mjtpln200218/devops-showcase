const http = require('node:http');

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  response.writeHead(404);
  response.end('Not found');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('API listening on port 3000');
});

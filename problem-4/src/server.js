const http = require('node:http');
const { MongoClient } = require('mongodb');

const port = Number(process.env.PORT || 3000);
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error('MONGO_URL is required');
  process.exit(1);
}

async function start() {
  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    await client.db().command({ ping: 1 });

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
      console.log(`API listening on port ${port}; MongoDB connection is ready`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

start();

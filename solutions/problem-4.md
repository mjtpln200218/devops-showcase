# Problem 4: API Cannot Connect to MongoDB

## Scenario

A Node.js API and MongoDB are defined as separate services in Docker Compose.
MongoDB becomes healthy, but the API exits during startup because it cannot
connect to the database.

## Diagnosis

The API receives its database URI from the `MONGO_URL` environment variable in
`problem-4/compose.yaml`. The original value is:

```text
mongodb://localhost:27017/interview
```

Inside a container, `localhost` means that same container. The API therefore
tries to find MongoDB inside the API container, rather than connecting to the
separate MongoDB service.

Compose creates a network for the project and makes each service discoverable
to the other services by its service name. Here, the MongoDB service is named
`mongodb`.

## Fix

In `problem-4/compose.yaml`, change the API's `MONGO_URL` value to:

```yaml
MONGO_URL: mongodb://mongodb:27017/interview
```

The URI format is:

```text
mongodb://HOSTNAME:PORT/DATABASE
```

For service-to-service traffic, use the Compose service name as the hostname
and MongoDB's container port `27017`. A host port mapping is not needed for the
API to reach MongoDB over the Compose network.

## Troubleshooting Steps

From the `problem-4/` directory, inspect service state and logs:

```bash
docker compose ps
docker compose logs api
docker compose logs mongodb
```

Check whether MongoDB is healthy and read the API's actual connection error.
Then compare the hostname in the connection URI with the Compose service names.
This helps distinguish a name/network issue from MongoDB being stopped or not
ready yet.

The Compose file includes a MongoDB health check and makes the API wait for the
database service to become healthy. This handles startup readiness, but it
does not correct an invalid hostname.

## Verify

After editing the URI, rebuild and start the services from `problem-4/`:

```bash
docker compose up --build
```

Wait for the API's "MongoDB connection is ready" startup log. In another
terminal, check the API:

```bash
curl -i http://localhost:3000/health
```

Expect HTTP `200` and `{"status":"ok"}`. Stop the services with Ctrl+C, then
remove the Compose containers with:

```bash
docker compose down
```

## Key Networking Idea

- `localhost` inside a container refers to that container, not the host or a
  sibling container.
- Compose services on the same network can reach one another by service name.
- MongoDB listens on port `27017` inside its container. The API uses that
  container port for the connection.
- Publishing a port with `ports:` is for traffic coming from outside the
  Compose network, such as a browser reaching the API. It is not required for
  the API and MongoDB to communicate with each other.

## Interview Explanation

"The API and MongoDB were separate Compose services. The API's connection URI
used `localhost`, which resolves to the API container itself. I checked the
service status and logs, then changed the URI hostname to the MongoDB service
name, `mongodb`, and kept the database's internal port at 27017. The API then
connected and its health endpoint returned HTTP 200."
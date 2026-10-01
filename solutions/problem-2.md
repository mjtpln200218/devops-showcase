# Problem 2: Running Container Is Not Reachable

## Scenario

The API process is running inside a container, but a request from the host to
`http://localhost:3001/health` fails.

## Diagnosis

The API listens on port `3000` inside the container. The container can be
running and listening internally without making that port available on the
host. The exercise container was started without a published-port mapping.

Check the running state and port mappings with:

```bash
docker ps
```

The `PORTS` column shows published mappings. A container port listed without a
host-side mapping is not reachable through the host's `localhost` port.

## Fix

Publish host port `3001` and forward it to container port `3000` when creating
the container:

```bash
docker run --rm -p 3001:3000 devops-interview-p1
```

The format is:

```text
-p HOST_PORT:CONTAINER_PORT
```

Here, requests to host port `3001` are forwarded to the API's container port
`3000`. The application and its internal port do not need to change.

Port mappings are set when a container is created. To add or change one, stop
and recreate the container with the desired `-p` option; restarting the same
container does not add a mapping.

## Verify

Keep the `docker run` terminal open. In another terminal, check the endpoint:

```bash
curl -i http://localhost:3001/health
```

Expect HTTP `200` and `{"status":"ok"}`. If the host port is already in use,
choose a different host port, for example `-p 3100:3000`, and request
`http://localhost:3100/health` instead.

## Important Port Distinction

- `server.listen(3000, '0.0.0.0', ...)` makes the app listen on container port
  `3000` and accept connections through the container's network interfaces.
- `EXPOSE 3000` documents the intended container port. It does not publish it
  to the host.
- `-p 3001:3000` creates the host-to-container port forwarding.

If the container exits, investigate its logs first. If it stays running but
cannot be reached, inspect the listening port and published mapping.

## Interview Explanation

"The API was listening on container port 3000, but Docker had not published a
host port for it. I recreated the container with `-p 3001:3000`, then checked
the health endpoint from the host. I did not change the app's listening port
because the host port and container port can differ."
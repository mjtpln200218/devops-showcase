# Problem 3: Application Starts Locally but Exits in Docker

## Scenario

The API can start locally when launched with its required configuration. The
Docker image builds, but the container exits shortly after startup.

## Diagnosis

The application reads `APP_PORT` from the process environment:

```javascript
const portValue = process.env.APP_PORT;
```

If it is missing, `server.js` prints an error and exits. Locally, the variable
was provided in the command that starts the app. The Dockerfile's `CMD` runs
`npm start`, but the container was started without providing `APP_PORT`.

`EXPOSE 3000` does not set an environment variable. It only documents the
container port the application is expected to use.

## Fix

Pass `APP_PORT` into the container at runtime. From the repository root, run:

```bash
docker run --rm -e APP_PORT=3000 -p 3100:3000 devops-interview-p3
```

`-e APP_PORT=3000` sets the environment variable inside the container. The
application then listens on container port `3000`. The `-p 3100:3000` mapping
makes it reachable through host port `3100`.

Locally, the app can be started with a different port like this:

```bash
cd problem-3
APP_PORT=3100 npm start
```

This syntax sets the variable for that command on Linux and macOS. In a shared
deployment, runtime configuration can instead be supplied through Docker
Compose, Kubernetes, or the deployment platform. Avoid putting secrets in a
Dockerfile or baking them into an image.

## Verify

After starting the container, keep its terminal open and run this in another
terminal:

```bash
curl -i http://localhost:3100/health
```

Expect HTTP `200` and `{"status":"ok"}`. The container should remain running
until you stop it with Ctrl+C.

## What to Check Next Time

- Check the container logs when the process exits.
- Find which environment variables the application requires.
- Compare the environment available locally with the environment passed to the
  container.
- Keep the app's listening port, Docker's container port, and host port
  distinct in your notes.

## Interview Explanation

"The application required `APP_PORT`, and I supplied it in my local startup
command. The container did not receive that variable, so the application exited
before listening. I passed it at runtime with Docker's `-e` option, published
the container port, and verified the health endpoint returned HTTP 200."
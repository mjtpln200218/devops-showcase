# Problem 1: Container Exits During Startup

## Scenario

The Docker image builds, but the container exits immediately instead of keeping
the Node.js API running.

## Diagnosis

The original Dockerfile used this startup command:

```dockerfile
CMD ["node", "server.js"]
```

The Dockerfile sets `/app` as its working directory and copies the source folder
to `/app/src`. That means the application file is at `/app/src/server.js`, but
the command asks Node.js to load `/app/server.js`. Node cannot find that file,
so it exits with a `MODULE_NOT_FOUND` error. When the main process exits, the
container stops too.

## Fix

The project already defines a start script in `package.json`:

```json
"start": "node src/server.js"
```

Set the Dockerfile's default command to run that script:

```dockerfile
CMD ["npm", "start"]
```

Another valid fix is to run the correct file directly:

```dockerfile
CMD ["node", "src/server.js"]
```

Using `npm start` reuses the project's start script, so it is less likely for
the Docker command and the project script to drift apart.

## Verify

From the project root, build the image and start the container with its API port
published:

```bash
docker build -t devops-interview-p1 .
docker run --rm -p 3000:3000 devops-interview-p1
```

Keep that terminal open. In another terminal, check the health endpoint:

```bash
curl -i http://localhost:3000/health
```

Expect HTTP `200` and a response body of `{"status":"ok"}`. Stop the running
container with Ctrl+C; `--rm` removes it after it stops.

## What to Check Next Time

- Read the container logs to see the startup error.
- Compare the Dockerfile's `WORKDIR` and `COPY` destinations with the file path
  used by `CMD`.
- Distinguish a process startup failure from a network or port-publishing issue.

Changing `EXPOSE` or the port mapping would not fix a command that points to a
file that does not exist.

## Interview Explanation

"The image built, but the container exited because its startup command pointed
to the wrong path. The source file was copied under `/app/src`, while the
command looked under `/app`. I changed the command to use the package's start
script, rebuilt the image, and confirmed the health endpoint returned HTTP
200."
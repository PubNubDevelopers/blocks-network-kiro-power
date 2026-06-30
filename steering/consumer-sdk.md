# Consumer SDK

Use this file when the user wants an app, script, backend, or frontend to call Blocks agents programmatically.

## Install

Node consumers use:

```bash
npm install @blocks-network/sdk
```

The latest verified package version for this power release is `1.0.3`.

## Scaffold A Consumer Project

Use a consumer scaffold when the user wants a script that calls existing agents and does not publish an agent:

```bash
blocks init my_consumer --yes --language node --mode consumer
```

Consumer projects do not include `agent-card.json` or `handler.ts`.

## Basic TaskClient Pattern

```typescript
import "dotenv/config";
import { TaskClient, textPart } from "@blocks-network/sdk";

const client = await TaskClient.create({
  billingMode: "free",
  apiKey: process.env.BLOCKS_API_KEY!,
});

const session = await client.sendMessage({
  agentName: "my_agent",
  requestParts: [textPart("Summarize this text.", "request")],
});

session.onProgress((event) => {
  console.log(event.message);
});

const terminal = await session.waitForTerminal(60_000);
console.log(terminal.state);

for (const artifact of session.listArtifacts()) {
  const downloaded = await session.downloadArtifact(artifact);
  console.log(downloaded.fileName, downloaded.data.length);
}

await session.asyncClose();
client.destroy();
```

## Authentication Modes

`TaskClient.create` requires exactly one auth mode:

- `apiKey`: server-side scripts and trusted environments.
- `tokenEndpoint`: browser/mobile apps that use a backend token proxy.
- `tokenProvider`: custom token management.

Always set `billingMode` to `free` or `paid`. It must match the target agent's registry billing mode unless the caller is exempt as a same-org authenticated caller.

## Request Parts

Use helper functions from `@blocks-network/sdk`:

```typescript
import { textPart, filePart } from "@blocks-network/sdk";

requestParts: [
  textPart(JSON.stringify({ query: "weather", limit: 10 }), "request"),
  filePart(fileBytes, {
    partId: "document",
    fileName: "document.pdf",
    contentType: "application/pdf"
  })
]
```

For JSON form inputs, `textPart` usually carries a JSON-stringified object whose keys match the agent card schema.
For binary or file inputs, use `filePart(...)` with `contentType` and, when available, `fileName`.

## Sessions

Register callbacks before waiting:

```typescript
session.onArtifact((event) => console.log(event.artifactRef));
session.onStream((ref) => console.log(ref.descriptor));
session.onTerminal((event) => console.log(event.state));
session.onCancelRequested((event) => console.log(event.ts));
session.onError((error) => console.error(error));
```

Useful methods:

- `waitForTerminal(timeoutMs)`
- `listEvents()`
- `listArtifacts()`
- `downloadArtifact(ref)`
- `saveArtifacts(dir)`
- `waitForStream(id?)`
- `connect({ taskId })`
- `cancel()`
- `terminate()`
- `close()` / `asyncClose()`

Always close sessions and destroy clients when finished.

## Reconnect

```typescript
const session = await client.connect({ taskId: "task-id" });
const events = session.listEvents();
const artifacts = session.listArtifacts();
```

Use reconnect for long-running tasks, delayed artifact retrieval, or process restarts.

## Browser And Serverless Guidance

Do not expose `BLOCKS_API_KEY` in browser code. Use `tokenEndpoint` from your backend.

In serverless environments, avoid relying on a long-lived process singleton. Recreate or cache credentials per request as appropriate for the platform.

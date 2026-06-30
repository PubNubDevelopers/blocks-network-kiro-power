# Agent Card, IO, And Streaming

Use this file before editing `agent-card.json`, handler I/O, task kinds, or streams.

## Required Agent Card Shape

Required top-level sections:

- `identity`
- `capabilities`
- `tags`
- `runtime`

Required identity fields:

- `agentName`
- `displayName`
- `description`
- `version`
- `provider.organization`

Required runtime fields:

- `handler`
- `maxRunningTimeSec`

Recommended runtime defaults for simple request agents:

```json
{
  "runtime": {
    "handler": "./handler.ts",
    "handlerExport": "default",
    "concurrency": 1,
    "expectedInstances": 1,
    "maxRunningTimeSec": 60
  }
}
```

Use longer `maxRunningTimeSec` values for LLM-backed, multi-step, or long-running workloads.

## Task Kinds

`capabilities.taskKinds` can contain:

- `"request"`: request/response tasks.
- `"pipe"`: long-running streaming tasks with explicit duration.

For consumer pipe tasks, `duration` is required and is measured in minutes.

## IO Schema Rules

Each input requires:

- `id`
- `description`
- `contentType`
- `required`

Each output requires:

- `id`
- `contentType`
- `guaranteed`

### Form-Class Inputs

Examples: `application/json`, `application/ld+json`, vendor `*/*+json`.

Rules:

- `schema` required.
- `example` required.
- `schema.type` must be `"object"`.
- `schema.properties` must match handler fields.
- Put defaults under `schema.properties[*].default`.

Example:

```json
{
  "id": "request",
  "description": "Search parameters.",
  "contentType": "application/json",
  "required": true,
  "example": { "query": "weather", "limit": 10 },
  "schema": {
    "type": "object",
    "required": ["query"],
    "properties": {
      "query": { "type": "string", "title": "Search Query" },
      "limit": { "type": "integer", "title": "Limit", "default": 10 }
    }
  }
}
```

### Text-Class Inputs

Examples: `text/plain`, `text/markdown`.

Rules:

- `schema` forbidden.
- `accept` forbidden.
- `maxSizeBytes` forbidden.
- Use top-level string `example` for textarea defaults.

### File-Class Inputs

Examples: `application/pdf`, `image/png`, `application/octet-stream`.

Rules:

- `schema` forbidden.
- `accept` optional.
- `maxSizeBytes` optional, up to 25 MB.

## Streaming

Streaming is declared in a top-level `streams` block, not inside `capabilities`.

Request-only agents can declare only `_default`:

```json
{
  "streams": {
    "_default": {
      "direction": "outbound",
      "format": "bytes",
      "description": "Main output stream"
    }
  }
}
```

Supported stream directions:

- `outbound`
- `inbound`
- `bidirectional`

Supported formats:

- `bytes`
- `events`

Rules:

- Byte streams use `contentType`; they must not use `schema`.
- Unidirectional event streams use `schema`.
- Bidirectional event streams must use both `outboundSchema` and `inboundSchema`.
- Do not place stream configuration inside `capabilities`.

## Handler-Side Streaming

```typescript
const stream = await ctx.createStream({
  declaredStream: "_default",
  bundleSizeBytes: 4096,
  maxLatencyMs: 100
});

stream.write("hello");
await stream.end();
```

Use `stream.events<T>()` for events streams and `stream.bytes()` for bytes streams. Avoid low-level `stream.inbound` unless envelope metadata is truly needed.

## Validation

Run:

```bash
blocks check
```

Common validation failures:

- Missing `runtime.maxRunningTimeSec`.
- Handler path does not exist.
- `capabilities` contains keys other than `taskKinds`.
- Form-class input missing `schema` or `example`.
- Text/file input incorrectly includes `schema`.
- Bidirectional event stream missing `outboundSchema` or `inboundSchema`.

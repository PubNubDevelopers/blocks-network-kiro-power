# Build Provider Agents

Use this file when the user wants to build a Blocks provider agent: an agent that receives tasks on Blocks Network and returns artifacts or streams.

## Decide The Project Shape

Confirm product decisions before creating or modifying provider metadata:

- Agent name: must match `^[a-zA-Z0-9_]+$`; use underscores, not hyphens.
- Display name and description: these ship to the registry.
- Task kind: `request` for normal request/response agents, `pipe` for long-running streaming tasks.
- Language: default to Node/TypeScript. Use Python only when the user asks for it.

Do not infer final registry metadata from the directory name alone.

## Install Or Verify CLI

Use the latest CLI:

```bash
npm install -g @blocks-network/cli
blocks version
```

Expected verified version for this power release: `1.0.3`.

## Scaffold

Run from the parent directory. Do not create the project directory first; `blocks init` creates it.

```bash
blocks init my_agent --yes --language node --mode provider
```

The Node provider scaffold includes:

- `agent-card.json`
- `handler.ts`
- `trigger.ts`
- `package.json`
- `.env`
- `.npmrc`
- `.gitignore`
- `Dockerfile`

## Implement Handler

Handlers should default-export an async function:

```typescript
import type { HandlerResult, StartTaskMessage, TaskContext } from "@blocks-network/sdk";

export default async function handler(
  task: StartTaskMessage,
  ctx?: TaskContext,
): Promise<HandlerResult> {
  const input = task.requestParts?.[0];
  const text = typeof input === "string" ? input : JSON.stringify(input ?? "");
  ctx?.reportStatus("Processing...");

  return {
    artifacts: [
      {
        data: text,
        mimeType: "text/plain",
        outputId: "result"
      }
    ]
  };
}
```

Always treat `ctx` as optional in unit tests and local handler calls. Use `ctx?.reportStatus(...)` unless the code truly requires runtime context.

## Update Agent Card

Before validation, ensure `agent-card.json` has:

- `identity.agentName`, `displayName`, `description`, `version`, `provider.organization`.
- `capabilities.taskKinds`.
- At least one `tags[]` entry.
- `runtime.handler`.
- `runtime.maxRunningTimeSec`.
- `io.inputs[]` and `io.outputs[]` matching what the handler reads and returns.

For simple request/response work, start with:

```json
"runtime": {
  "handler": "./handler.ts",
  "handlerExport": "default",
  "concurrency": 1,
  "expectedInstances": 1,
  "maxRunningTimeSec": 60
}
```

## Validate

Run validation from the agent directory:

```bash
blocks check
```

`blocks check` validates `agent-card.json` and confirms the file referenced by `runtime.handler` exists.

For hello-world, smallest-agent, scaffold, or local smoke-test requests, stop here after `blocks check` passes unless the user explicitly asks to go live. Do not suggest login, publish, `blocks run`, or `npx tsx trigger.ts` as the immediate continuation for local-only validation.

## Minimal Hello World Handler

For the smallest safe local provider example, keep the handler request/response only and validate it with `blocks check`:

```typescript
import type { HandlerResult, StartTaskMessage, TaskContext } from "@blocks-network/sdk";

export default async function handler(
  _task: StartTaskMessage,
  _ctx?: TaskContext,
): Promise<HandlerResult> {
  return {
    artifacts: [{ data: "Hello, World!", mimeType: "text/plain" }]
  };
}
```

Keep `identity.agentName` unchanged from the scaffold unless the user asks to rename the agent.

## User-Owned Live Steps

Only provide these when the user explicitly asks to register, publish, run, or test against the live Blocks Network. Do not run these on the user's behalf.

`blocks run` starts a long-running local provider instance and expects the agent to exist in the Blocks registry. A fresh scaffold-only agent can fail with `Agent "<name>" not found in registry`; publish or register first.

Provide commands for the user:

```bash
blocks login --write-env
blocks publish --billing-mode free --listing public --accept-terms
blocks run
```

After the user starts the agent, a test trigger can be run from another terminal in the same agent directory:

```bash
npx tsx trigger.ts
```

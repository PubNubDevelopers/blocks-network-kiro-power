---
name: "blocks-network"
displayName: "Blocks Network"
description: "Build, publish, manage, and call Blocks Network agents with the current Blocks CLI, SDK, MCP server, and webapp workflows."
keywords: ["blocks", "blocks network", "agents", "mcp", "cli", "sdk", "streaming", "a2a"]
author: "Blocks Network"
---

# Blocks Network

Use this power when a user is building, publishing, managing, or calling Blocks Network agents.

Blocks Network lets developers connect AI agents to a network so other tools, applications, and agents can discover and call them. This power combines:

- A guided MCP server for calling existing Blocks agents from Kiro.
- Knowledge-base guidance for building provider agents with the Blocks CLI and SDK.
- Reference workflows for publishing, consuming, webapp scaffolds, IO schemas, streaming, and troubleshooting.

Package versions verified on June 26, 2026:

- `@blocks-network/cli@1.0.3`
- `@blocks-network/sdk@1.0.3`
- `@blocks-network/mcp-server@1.0.3`
- local `blocks version`: `1.0.3`

## Available MCP Server

This power includes a Blocks Network MCP server configuration:

```json
{
  "mcpServers": {
    "blocks-network": {
      "command": "npx",
      "args": ["-y", "@blocks-network/mcp-server"]
    }
  }
}
```

The MCP server is for consuming Blocks agents from Kiro. Use it to inspect the registry, call existing agents, monitor tasks, download artifacts, and manage consumer-side task lifecycle. Provider-agent authoring still uses the Blocks CLI and SDK guidance in the steering files.

### MCP Environment

The server reads these environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `BLOCKS_API_KEY` | Required for private or paid agents | Authenticates consumer operations. Public free agents can work without it. |
| `BLOCKS_ORG_ID` | Required only for billing tools | Enables `check_balance` and `request_topup`. |
| `BLOCKS_MCP_FILE_ROOT` | Optional | Restricts file uploads and artifact saves to an allowed local root. |

Never invent API keys, org IDs, or file roots. If a required value is missing, ask the user for it or continue with public-free-agent-only operations when appropriate.

### MCP Tools

The MCP server exposes these generic tools for any agent name:

| Tool | Use |
| --- | --- |
| `send_task` | Send a task to an agent and wait for terminal output. |
| `get_task` | Inspect task status and artifacts. |
| `list_tasks` | List tasks, optionally filtered by agent or state. |
| `cancel_task` | Request cancellation for a running task. |
| `pause_task` | Pause a running pipe task. |
| `resume_task` | Resume a paused pipe task. |
| `retry_task` | Retry a failed task. |
| `list_agents` | List registry agents. |
| `search_agent` | Search registry agents by query, provider, tag, listing, and online status. |
| `get_agent_card` | Read an agent card before calling an agent. |
| `get_agent_status` | Check live availability for one or more agents. |
| `connect_task` | Reconnect to an existing task and stream task events. |
| `download_artifact` | Download a task artifact inline or to `BLOCKS_MCP_FILE_ROOT`. |
| `check_balance` | Check consumer billing balance for `BLOCKS_ORG_ID`. |
| `request_topup` | Create a top-up checkout URL for `BLOCKS_ORG_ID`. |

Before calling `send_task`, prefer `search_agent` or `get_agent_card` unless the user already provided the exact target agent and expected input.

## When To Load Steering Files

Read the relevant steering file before acting on that workflow:

- Building a new provider agent with `blocks init` -> `steering/build-provider-agents.md`
- Registering, publishing, running, dashboard, invites, or lifecycle changes -> `steering/publish-manage-agents.md`
- Calling Blocks agents from TypeScript or JavaScript code -> `steering/consumer-sdk.md`
- Calling Blocks agents from Kiro or another MCP host -> `steering/mcp-agent-access.md`
- Creating static webapps wired to Blocks agents -> `steering/webapp-mode.md`
- Editing `agent-card.json`, IO schemas, task kinds, streams, or handlers -> `steering/agent-card-io-streaming.md`
- Diagnosing CLI, SDK, MCP, auth, schema, stream, billing, or runtime errors -> `steering/troubleshooting.md`

Multiple steering files may be needed for one task. For example, a streaming provider agent needs both `build-provider-agents.md` and `agent-card-io-streaming.md`.

## Core Safety Rules

- Do not run `blocks register` on the user's behalf unless the user explicitly asks to register the agent. It changes registry state by creating or updating a Private + Free agent.
- Do not run `blocks publish` on the user's behalf. Give the user the exact command to run.
- Do not run `blocks run` on the user's behalf. It starts a long-running local agent process; the user should own that process.
- For hello-world, smallest-agent, scaffold, or local smoke-test requests, stop at `blocks check` unless the user explicitly asks to go live. Do not offer register, `blocks run`, `trigger.ts`, login, or publish as the immediate continuation.
- Current live-provider flow is `blocks login --write-env` -> `blocks register` -> `blocks run`. `blocks register` is the recommended first registry step because it creates a Private + Free agent without visibility or billing prompts.
- Use `blocks publish` later to make an already-registered agent public, paid, or otherwise change visibility, billing mode, pricing, or trial settings.
- `blocks run` requires an agent that is already registered or published in the Blocks registry. Fresh scaffold-only agents can fail with `Agent "<name>" not found in registry`.
- Do not submit paid tasks, request billing top-ups, or use private-agent credentials unless the user clearly requested that specific action.
- Do not write secrets into committed files. Use `.env`, host MCP config, or environment variables.
- Always pass explicit non-interactive flags for Blocks CLI commands in agent-driven shells.
- Always use `--language node` unless the user explicitly requests Python.
- Use `--mode`, not legacy `--type`, with current Blocks CLI examples.
- Prefer `blocks check` before any register or publish handoff.

## Quick Workflows

### Build A Provider Agent

Use this when the user wants to create an agent that others can call:

```bash
npm install -g @blocks-network/cli
blocks init my_agent --yes --language node --mode provider
cd my_agent
blocks check
```

Then implement `handler.ts`, update `agent-card.json`, and run `blocks check` again. For a local hello-world or scaffold smoke test, this is the stopping point.

Only when the user explicitly asks to register, publish, or run the agent, load `steering/publish-manage-agents.md` and hand off the live commands. Do not present these as the default next step for a local smoke test.

Recommended first live handoff:

```bash
blocks login --write-env
blocks register
blocks run
```

When the private test works and the user wants public browser callers, hand off:

```bash
blocks publish --billing-mode free --listing public --accept-terms
```

### Call Agents From Kiro

Use the included MCP tools:

1. Find a target with `search_agent` or `list_agents`.
2. Inspect it with `get_agent_card`.
3. Send work with `send_task`.
4. Use `connect_task`, `get_task`, or `download_artifact` when work continues beyond the initial wait.

### Call Agents From Code

Use `@blocks-network/sdk`:

```typescript
import "dotenv/config";
import { TaskClient, textPart } from "@blocks-network/sdk";

const client = await TaskClient.create({
  billingMode: "free",
  apiKey: process.env.BLOCKS_API_KEY!,
});

const session = await client.sendMessage({
  agentName: "my_agent",
  requestParts: [textPart("Hello from Blocks", "request")],
});

const terminal = await session.waitForTerminal(60_000);
console.log(terminal.state);

await session.asyncClose();
client.destroy();
```

## License And Support

This power is licensed under MIT.

This power integrates with `@blocks-network/mcp-server` from the Blocks SDK repository. The MCP server is published under the Blocks Network SDK License Agreement (`NOASSERTION` / custom license).

- Privacy Policy: https://blocks.ai/legal/privacy
- Support: https://github.com/blocksnetwork/blocks-sdk/issues
- Community Support: https://discord.gg/cAmDfWBbzP

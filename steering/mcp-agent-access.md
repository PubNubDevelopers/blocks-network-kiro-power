# MCP Agent Access

Use this file when Kiro or another MCP-compatible host should call Blocks Network agents without writing custom consumer code.

## What The MCP Server Does

`@blocks-network/mcp-server` is a standalone MCP server for consumer operations. It is not the Blocks CLI itself.

It lets an MCP host:

- Search and list Blocks agents.
- Inspect agent cards.
- Send tasks to agents.
- Reconnect to tasks.
- Download artifacts.
- Manage task lifecycle.
- Check billing balance or create top-up links when `BLOCKS_ORG_ID` is configured.

## Configuration

This power ships:

```json
{
  "mcpServers": {
    "blocks-network": {
      "command": "npx",
      "args": ["-y", "@blocks-network/mcp-server"],
      "env": {
        "BLOCKS_API_KEY": "${BLOCKS_API_KEY}",
        "BLOCKS_ORG_ID": "${BLOCKS_ORG_ID}",
        "BLOCKS_MCP_FILE_ROOT": "${BLOCKS_MCP_FILE_ROOT}"
      }
    }
  }
}
```

If the host does not expand `${VAR}` placeholders, configure real values in the host's MCP settings instead.

## Environment Variables

| Variable | Required | Notes |
| --- | --- | --- |
| `BLOCKS_API_KEY` | Private or paid agents | Public free agents can work without it. |
| `BLOCKS_ORG_ID` | Billing tools only | Required by `check_balance` and `request_topup`, alongside `BLOCKS_API_KEY`. |
| `BLOCKS_MCP_FILE_ROOT` | Optional | Restricts file upload and artifact save paths. |

Ask before transmitting private credentials, private files, billing actions, or paid-agent task requests.

## Discovery First

When the user asks to call an agent but has not provided an exact agent name:

1. Use `search_agent` with a concise query.
2. Use `get_agent_card` on promising candidates.
3. Confirm the input shape and billing/listing before calling `send_task`.

When the user provides an exact agent name:

1. Use `get_agent_card`.
2. Build inputs to match the card.
3. Use `send_task`.

## Tool Reference

| Tool | Notes |
| --- | --- |
| `send_task` | Sends a task and waits for result. Supports text message, `inputs`, file attachment, task kind, duration, and timeout. |
| `get_task` | Reads current task state and artifact summary. |
| `list_tasks` | Lists tasks filtered by agent, state, and limit. |
| `cancel_task` | Cooperative cancel for running tasks. |
| `pause_task` | Pauses pipe tasks. |
| `resume_task` | Resumes paused pipe tasks. |
| `retry_task` | Retries failed tasks. |
| `list_agents` | Lists registry agents, with public/private and online filters. |
| `search_agent` | Free-text and structured registry search. |
| `get_agent_card` | Full card: inputs, outputs, tags, task kinds, pricing. |
| `get_agent_status` | Online instance count, total task count, and per-instance SDK/CLI versions. Per-instance live activity counters (`activeTasks`, `concurrentTasksPerInstance`, `startedAt`, `totalActiveTasks`) are reserved but currently return 0. |
| `connect_task` | Reconnects and streams task events. |
| `download_artifact` | Downloads inline or saves under `BLOCKS_MCP_FILE_ROOT`. |
| `check_balance` | Needs `BLOCKS_ORG_ID`. |
| `request_topup` | Creates checkout URL; user completes payment in browser. |

## File Attachments

For `send_task` with `filePath`:

- File must exist locally.
- Resolved file path must be inside `BLOCKS_MCP_FILE_ROOT`.
- File must be 25 MB or smaller.

Do not attach user files unless the user explicitly asked to send that file to the target Blocks agent.

## Billing And Privacy

- Public free agents can often be called without `BLOCKS_API_KEY`.
- Private agents require `BLOCKS_API_KEY`.
- Paid agents require authenticated billing context.
- Billing tools (`check_balance`, `request_topup`) require both `BLOCKS_API_KEY` and `BLOCKS_ORG_ID`; org id alone is not sufficient.
- `request_topup` creates a payment checkout URL; do not call it unless the user explicitly requests a top-up.

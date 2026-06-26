# Troubleshooting

Use this file for Blocks CLI, SDK, MCP, agent-card, auth, billing, stream, and runtime failures.

## CLI Not Found

Symptoms:

- `blocks: command not found`
- Shell cannot locate `blocks`

Fix:

```bash
npm install -g @blocks-network/cli
blocks version
```

If installed by the POSIX installer, ensure `$HOME/.blocks/bin` is on `PATH`.

## Wrong CLI Syntax

Use current syntax:

```bash
blocks init my_agent --yes --language node --mode provider
blocks init my_consumer --yes --language node --mode consumer
blocks init my_webapp --yes --language node --mode webapp --agent my_agent
```

Do not use legacy `--type` examples.

## Login Does Not Write `.env`

Bare `blocks login` may skip write-env behavior in non-interactive shells.

Use:

```bash
blocks login --write-env
```

or from a parent directory:

```bash
blocks login --write-env --dir ./my_agent
```

## Publish Hangs

In non-interactive shells, bare `blocks publish` waits for prompts.

Give the user explicit flags:

```bash
blocks publish --billing-mode free --listing public --accept-terms
```

Do not run this command on the user's behalf.

## `blocks check` Fails

Common causes:

- `agent-card.json` is invalid JSON.
- Required fields are missing.
- `runtime.maxRunningTimeSec` missing.
- `runtime.handler` points to a missing file.
- `capabilities` contains unsupported keys.
- IO schema does not match the input transport class.
- Streams are nested under `capabilities` instead of top-level `streams`.

Run `blocks check` after each agent-card or handler shape change.

## Agent Name Rejected

Agent names must match:

```text
^[a-zA-Z0-9_]+$
```

Use underscores, not hyphens.

If publish reports the name is already taken, ask the user for a more unique name and update `identity.agentName`.

## SDK Billing Mode Mismatch

Symptom:

- `BillingModeMismatchError`

Cause:

- `TaskClient.create({ billingMode })` does not match the target agent's registered billing mode.

Fix:

- Inspect the agent card or registry.
- Use `billingMode: "free"` for free agents and `"paid"` for paid agents.

## Auth Refresh Failure

Symptom:

- `AuthRefreshFailedError`

Fix:

- Recreate `TaskClient` with valid credentials.
- Verify `BLOCKS_API_KEY`.
- Register `onAuthError` for user-facing re-auth flows.

## Pipe Task Rejected

Common causes:

- Missing `duration`.
- `duration` is not an integer.
- `duration` is outside `1..43200`.
- `duration` was sent for a non-pipe task.

Duration is measured in minutes.

## Stream Data Looks Wrong

Use high-level stream readers:

- `stream.events()` for event streams.
- `stream.bytes()` for byte streams.

Avoid `stream.inbound` unless you need raw envelope metadata.

## Stream Unavailable

Symptom:

- `StreamUnavailableError`

Cause:

- The task is already terminal and live stream data is gone.

Fix:

- Retrieve artifacts with `listArtifacts()` / `downloadArtifact()`.
- Open streams while the task is active for live data.

## MCP Server Fails To Start

Check:

- Node.js 20 or later is available.
- `npx -y @blocks-network/mcp-server` can run.
- Host MCP config passes environment values correctly.
- `BLOCKS_API_KEY` is set for private or paid agents.

Public free agents can work without `BLOCKS_API_KEY`; the server may still print a warning.

## MCP File Upload Rejected

Check:

- File exists.
- File is 25 MB or smaller.
- File resolves under `BLOCKS_MCP_FILE_ROOT`.

Do not loosen file roots without user approval.

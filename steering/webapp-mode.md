# Webapp Mode

Use this file when the user wants a static webapp scaffold that calls one or more Blocks agents.

## Purpose

`blocks init --mode webapp` creates a web frontend pre-wired to Blocks agent calls. It is for app builders, demos, portals, and lightweight user interfaces around existing Blocks agents.

## Scaffold

Webapp scaffolds require a project name and at least one agent:

```bash
blocks init my_agent_app --yes --language node --mode webapp --agent my_agent
```

Multiple agents can be provided by repeating `--agent`:

```bash
blocks init my_agent_app --yes --language node --mode webapp --agent summarizer --agent translator
```

The generator fetches each agent's card from the registry and emits per-agent input/output/stream wiring code.

## After Scaffolding

Inspect generated files before editing:

```bash
npm install
npm run dev
```

If the project has a deploy command, use the generated README or package scripts as the source of truth.

## Agent Selection

Before scaffolding:

1. Use the MCP `search_agent` or `list_agents` tool to discover agents.
2. Use `get_agent_card` to confirm exact names and input shapes.
3. Confirm the target agents with the user if the choice is ambiguous.

## Auth Model

Do not place provider or consumer API keys directly in browser code.

For public free agents, anonymous or embed-auth flows may be enough depending on the generated scaffold. For private or paid agents, use the generated backend/token flow or a server-side proxy, not a hard-coded browser secret.

## When Not To Use Webapp Mode

Do not use webapp mode when the user wants:

- A provider agent that receives tasks: use `--mode provider`.
- A command-line script that calls agents: use `--mode consumer`.
- An MCP host integration: use `@blocks-network/mcp-server`.

# Publish And Manage Agents

Use this file for authentication, registration, publishing, dashboard, private access, and ongoing agent management.

## Authentication

Always pass an explicit write choice:

```bash
blocks login --write-env
```

When running from a parent directory and targeting a project:

```bash
blocks login --write-env --dir ./my_agent
```

For CI or existing API keys:

```bash
blocks login --api-key "$BLOCKS_API_KEY" --write-env
```

or:

```bash
blocks login --api-key-stdin --write-env
```

The user should provide secrets through the shell, `.env`, or host secret storage. Never commit `BLOCKS_API_KEY`.

## Identity Checks

```bash
blocks whoami
blocks whoami --json
blocks logout
blocks version
```

Use `blocks whoami --json` when a workflow needs `org_id`, key expiry, or structured authentication state.

## Register

Run `blocks register` after `blocks login --write-env` and `blocks check`. It is the recommended first registry step for a provider agent because it creates or updates a Private + Free agent without visibility, billing, or pricing prompts.

Do not run `blocks register` on the user's behalf unless they explicitly ask to register the agent. It changes registry state.

For the first private live test:

```bash
blocks login --write-env
blocks check
blocks register
```

Flags to know:

| Flag | Purpose |
| --- | --- |
| `--api-key` | Uses a pre-obtained API key. |
| `--api-key-stdin` | Reads an API key from stdin, useful for CI or headless sessions. |
| `--org-name` | Sets organization name when needed. |

`blocks register` always uses `--listing private` and `--billing-mode free`. To change visibility, billing mode, pricing, or trial settings later, use `blocks publish`.

## Publish

Do not run `blocks publish` on the user's behalf. Publishing can change visibility, billing mode, pricing, trial settings, and legal attestations.

Use `blocks publish` when the user wants to make an already-registered agent public, paid, or otherwise change listing and billing settings. For simple Private + Free testing, prefer `blocks register`.

Give the user one of these commands:

```bash
blocks publish --billing-mode free --listing public --accept-terms
```

```bash
blocks publish --billing-mode free --listing private --accept-terms
```

```bash
blocks publish --billing-mode paid --listing private --price-per-task 0.05 --accept-terms
```

Flags to know:

| Flag | Purpose |
| --- | --- |
| `--billing-mode free|paid` | Sets billing mode. |
| `--listing public|private` | Sets registry visibility. |
| `--price`, `--price-per-task`, `--price-per-minute` | Paid pricing. |
| `--free-units`, `--free-tasks`, `--free-minutes` | Trial units. |
| `--accept-terms` | Accepts publish terms non-interactively. |
| `--org-name` | Sets organization name on first publish. |
| `--api-key`, `--api-key-stdin` | Authenticates inline. |

Run `blocks check` before handing off register or publish commands.

## Run

Do not run `blocks run` on the user's behalf. It starts a long-running local process.

Only discuss `blocks run` after the user explicitly asks to start a live provider instance. For local scaffold or hello-world smoke tests, `blocks check` is the stopping point.

`blocks run` expects the agent to be registered or published in the Blocks registry. If the user only scaffolded the project, `blocks run` can fail with `Agent "<name>" not found in registry`. Have the user complete `blocks register` for Private + Free testing, or `blocks publish` when changing public/private or free/paid posture.

Ask the user to run:

```bash
blocks run
```

If dependencies are missing:

```bash
npm install
blocks run
```

Run `npx tsx trigger.ts` only after `blocks run` is already active, and run it from the agent directory that contains `trigger.ts`.

## Dashboard

```bash
blocks dashboard
blocks dashboard my_agent
```

The dashboard command uses the active Blocks deployment profile and dashboard base URL.

## Private Agent Access

For private listings:

```bash
blocks invite send my_agent --email user@example.com
blocks invite send my_agent --org consumer-org-slug
blocks invite list my_agent
blocks invite grants my_agent
blocks invite revoke my_agent --email user@example.com
blocks invite revoke my_agent --org consumer-org-slug
blocks invite accept <token>
```

`--email` and `--org` are mutually exclusive on send and revoke.

## Name Conflicts

If register or publish fails because `identity.agentName` is taken:

1. Tell the user the name is globally unavailable.
2. Ask for a more unique agent name.
3. Update `identity.agentName`.
4. Rename the directory only if it reduces confusion.
5. Re-run `blocks check`.
6. Ask the user to run register or publish again, depending on the workflow.

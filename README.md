# Blocks Network Kiro Power

Submission-ready Kiro Power for Blocks Network.

This repo packages Blocks Network guidance and a Blocks MCP server config so Kiro can help developers build, publish, manage, and call Blocks agents.

## Contents

- `POWER.md` - Kiro power metadata, activation guidance, MCP overview, and required license/support footer.
- `mcp.json` - Kiro MCP server config for `@blocks-network/mcp-server`.
- `steering/` - Workflow-specific guidance for CLI, SDK, MCP, webapp, schemas, streaming, and troubleshooting.
- `scripts/validate-power.mjs` - Local repository validator.

## Local Validation

```bash
npm test
```

The validator checks Kiro frontmatter, required files, steering references, MCP config, submission footer links, and stale CLI syntax.

## Import In Kiro

1. Open Kiro.
2. Go to Powers.
3. Choose Add Custom Power.
4. Select Import power from a folder.
5. Select this repository folder.

## Configuring MCP Secrets Locally

Keep the committed `mcp.json` placeholders as `${BLOCKS_API_KEY}`, `${BLOCKS_ORG_ID}`, and `${BLOCKS_MCP_FILE_ROOT}`. Set real values in your shell, Kiro MCP settings, or another host-level secret store instead. Never commit real credentials.

```bash
export BLOCKS_API_KEY="bk_..."
export BLOCKS_ORG_ID="..."
export BLOCKS_MCP_FILE_ROOT="$PWD"
```

`BLOCKS_API_KEY` is required for private or paid agents. Public free agents can work without it. The billing tools (`check_balance` and `request_topup`) require both `BLOCKS_API_KEY` and `BLOCKS_ORG_ID`. `BLOCKS_MCP_FILE_ROOT` is optional unless you want to constrain local file access.

## Suggested Kiro Submission

Use case:

```text
Build Blocks agents
```

Problem space:

```text
Helps developers build, publish, manage, and call Blocks Network agents using the current CLI, SDK, MCP server, and webapp workflows.
```

Public repository URL:

```text
https://github.com/PubNubDevelopers/blocks-network-kiro-power
```

## Verified Versions

Checked on June 26, 2026:

- `@blocks-network/cli@1.0.3`
- `@blocks-network/sdk@1.0.3`
- `@blocks-network/mcp-server@1.0.3`
- local `blocks version`: `1.0.3`

## License And Support

This power repo is licensed under MIT.

The included MCP server config launches `@blocks-network/mcp-server`, which is published from the Blocks SDK repository under the Blocks Network SDK License Agreement (`NOASSERTION` / custom license).

- Privacy Policy: https://blocks.ai/legal/privacy
- Support: https://github.com/blocksnetwork/blocks-sdk/issues
- Community Support: https://discord.gg/cAmDfWBbzP

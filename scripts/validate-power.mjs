import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function exists(relativePath) {
  try {
    statSync(join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function walk(dir) {
  const absolute = join(root, dir);
  const entries = readdirSync(absolute);
  const files = [];
  for (const entry of entries) {
    const relative = join(dir, entry);
    const stats = statSync(join(root, relative));
    if (stats.isDirectory()) files.push(...walk(relative));
    else files.push(relative);
  }
  return files;
}

const requiredFiles = [
  "POWER.md",
  "mcp.json",
  "README.md",
  "LICENSE",
  "package.json",
  "scripts/validate-power.mjs",
  "steering/build-provider-agents.md",
  "steering/publish-manage-agents.md",
  "steering/consumer-sdk.md",
  "steering/mcp-agent-access.md",
  "steering/webapp-mode.md",
  "steering/agent-card-io-streaming.md",
  "steering/troubleshooting.md"
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const power = read("POWER.md");
const frontmatterMatch = power.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatterMatch) {
  fail("POWER.md must start with YAML frontmatter");
} else {
  const allowed = new Set(["name", "displayName", "description", "keywords", "author"]);
  const seen = new Set();
  for (const line of frontmatterMatch[1].split("\n")) {
    const key = line.split(":")[0]?.trim();
    if (!key) continue;
    seen.add(key);
    if (!allowed.has(key)) fail(`Unsupported frontmatter field: ${key}`);
  }
  for (const key of ["name", "displayName", "description", "keywords", "author"]) {
    if (!seen.has(key)) fail(`Missing frontmatter field: ${key}`);
  }
  if (!frontmatterMatch[1].includes('name: "blocks-network"')) {
    fail('Expected frontmatter name: "blocks-network"');
  }
}

for (const text of [
  "steering/build-provider-agents.md",
  "steering/publish-manage-agents.md",
  "steering/consumer-sdk.md",
  "steering/mcp-agent-access.md",
  "steering/webapp-mode.md",
  "steering/agent-card-io-streaming.md",
  "steering/troubleshooting.md",
  "https://blocks.ai/legal/privacy",
  "https://github.com/blocksnetwork/blocks-sdk/issues",
  "https://discord.gg/cAmDfWBbzP",
  "Blocks Network SDK License Agreement",
  "NOASSERTION",
  "Current live-provider flow is `blocks login --write-env` -> `blocks register` -> `blocks run`",
  "Use `blocks publish` later to make an already-registered agent public",
  "blocks register"
]) {
  if (!power.includes(text)) fail(`POWER.md missing required text: ${text}`);
}

const mcp = JSON.parse(read("mcp.json"));
const server = mcp.mcpServers?.["blocks-network"];
if (!server) fail("mcp.json missing mcpServers.blocks-network");
if (server?.command !== "npx") fail('mcp.json command must be "npx"');
if (JSON.stringify(server?.args) !== JSON.stringify(["-y", "@blocks-network/mcp-server"])) {
  fail('mcp.json args must be ["-y", "@blocks-network/mcp-server"]');
}
const expectedEnv = {
  BLOCKS_API_KEY: "${BLOCKS_API_KEY}",
  BLOCKS_ORG_ID: "${BLOCKS_ORG_ID}",
  BLOCKS_MCP_FILE_ROOT: "${BLOCKS_MCP_FILE_ROOT}"
};
for (const [envName, expectedValue] of Object.entries(expectedEnv)) {
  if (server?.env?.[envName] !== expectedValue) {
    fail(`mcp.json env.${envName} must be ${expectedValue}`);
  }
}

function fencedCodeBlocks(body) {
  return [...body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((match) => match[1]);
}

const allMarkdown = [
  "POWER.md",
  "README.md",
  ...walk("steering").filter((file) => file.endsWith(".md"))
]
  .map((file) => [file, read(file)]);

for (const [file, body] of allMarkdown) {
  if (body.includes("--type ")) fail(`${file} uses stale --type CLI syntax`);
  if (body.includes("@blocks-network/mcp-server\"]") && !body.includes("\"-y\", \"@blocks-network/mcp-server\"")) {
    fail(`${file} references MCP server without npx -y`);
  }
  for (const block of fencedCodeBlocks(body)) {
    if (block.includes("blocks publish")) {
      for (const requiredFlag of ["--billing-mode", "--listing", "--accept-terms"]) {
        if (!block.includes(requiredFlag)) {
          fail(`${file} has a blocks publish example without ${requiredFlag}`);
        }
      }
    }
    if (block.includes("blocks publish") && block.includes("blocks run")) {
      const registerIndex = block.indexOf("blocks register");
      const runIndex = block.indexOf("blocks run");
      if (registerIndex === -1 || registerIndex > runIndex) {
        fail(`${file} has a live-provider code block with blocks publish and blocks run but no earlier blocks register`);
      }
    }
  }
}

if (errors.length) {
  console.error("Power validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Power validation passed.");

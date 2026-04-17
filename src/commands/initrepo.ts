import * as fs from 'fs';
import * as path from 'path';

export function runInitRepo(args: string[]): void {
  if (args.includes('--help') || args.includes('-h')) {
    printInitRepoHelp();
    return;
  }

  const positional = args.filter(a => !a.startsWith('--'));
  if (positional.length === 0) {
    console.error('Error: folder name is required');
    printInitRepoHelp();
    process.exit(1);
  }

  const folderName = positional[0];

  if (fs.existsSync(folderName)) {
    console.error(`Error: folder "${folderName}" already exists`);
    process.exit(1);
  }

  console.log(`→ Creating skills repository at ${folderName} ...`);

  // Create directory structure
  const dirs = [
    path.join(folderName, '.manifest'),
    path.join(folderName, 'creating-instructions'),
    path.join(folderName, 'skills-cli'),
  ];
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  // Write manifest files
  writeFile(path.join(folderName, '.manifest', '_global.json'), GLOBAL_JSON);
  writeFile(path.join(folderName, '.manifest', 'group-1.json'), GROUP1_JSON);
  writeFile(path.join(folderName, '.manifest', 'sub-group.json'), SUBGROUP_JSON);

  // Write creating-instructions skill
  writeFile(path.join(folderName, 'creating-instructions', 'SKILL.md'), CREATING_INSTRUCTIONS_SKILL);
  writeFile(path.join(folderName, 'creating-instructions', 'info.json'), CREATING_INSTRUCTIONS_INFO);

  // Write skills-cli skill
  writeFile(path.join(folderName, 'skills-cli', 'SKILL.md'), SKILLS_CLI_SKILL);
  writeFile(path.join(folderName, 'skills-cli', 'info.json'), SKILLS_CLI_INFO);

  // Write .gitignore
  writeFile(path.join(folderName, '.gitignore'), '# Skills repo .gitignore\n');

  console.log('  ✓ Files created');
  console.log(`\n✅ Skills repository initialized at ${folderName}`);
  console.log('\nNext steps:');
  console.log(`  cd ${folderName}`);
  console.log('  git init && git add . && git commit -m "init: skills repository"');
  console.log('  # Then push to your Git hosting');
}

function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

function printInitRepoHelp(): void {
  console.log(`Initialize a new skills repository with base structure.

Creates a folder with:
  .manifest/_global.json      — global skills config
  .manifest/group-1.json      — example group config
  .manifest/sub-group.json    — example sub-config
  creating-instructions/      — skill: how to create AI skills
  skills-cli/                 — skill: how to use this CLI tool

Usage:
  skills init-repo <folder-name>

Examples:
  skills init-repo my-skills-repo
  skills init-repo ../shared-skills
`);
}

const GLOBAL_JSON = `{
  "skills": [
    "creating-instructions",
    "skills-cli"
  ]
}
`;

const GROUP1_JSON = `{
  "skills": [],
  "sub-configs": ["sub-group"]
}
`;

const SUBGROUP_JSON = `{
  "skills": [],
  "sub-configs": []
}
`;

const CREATING_INSTRUCTIONS_SKILL = `# Skill: Creating Skills

## Motivation and Use Cases

- IDE-agnostic architecture allows teams to use different IDE/Plugins while sharing same skill base.
- Team alignment on LLM model choice is more critical than IDE choice — IDE switching is less disruptive.
- Skills are self-contained folders with \`SKILL.md\` describing SDLC workflows without platform-specific adapters like \`alwaysApply: true\` or \`mode: agent\`.
- Following Single Responsibility Principle (SRP) — one SDLC workflow piece per skill.
  + Recommended soft limit: ~700 lines per \`SKILL.md\`. Exceeding this is a signal to split.
  + Complex skills can reference other skills — composability over monoliths.
  + Terminology hint: large multi-step workflows → "agents", small focused actions → "skills". Naming may vary by author.
- \`main.agent.md\` serves as catalog of all skills with brief descriptions — when asked about (what to do), follow this skill (with file path).
  + Each entry has optional sub-fields after \`+\`: **Keywords** (trigger words), **Target** (file glob pattern), **Exceptions** (edge cases).
  + When adding new skill to catalog, fill in at least Keywords to help model match user requests to skills.
- Platform-specific entry points (\`.github/copilot-instructions.md\` for Copilot, \`.cursor/rules/*.mdc\` for Cursor, \`.claude/CLAUDE.md\` for Claude Code) reference \`main.agent.md\` to load with every prompt.
- Optionally, \`AGENTS.md\` in project root with same content as entry point — universal fallback recognized by Claude, Copilot, Cursor agents.
  + Important when \`.github/\`, \`.cursor/\`, or \`.claude/\` are not committed — without them other non-IDE agents have no entry point to discover \`instructions/\` folder.
  + Decision is up to the team.
- \`instructions/\` can live in the project repo or be extracted into a separate sub-repository (git submodule, etc.).
  + \`.github/\`, \`.cursor/\` stay local per team member's IDE choice — not committed.
  + For cloud agents — add \`AGENTS.md\` in project root as described above.
  + Or commit skills together with the project — simpler, fewer moving parts.
  + Each team decides what fits their workflow.
- Why tool-agnostic over native systems (GitHub \`.instructions.md\`, Cursor \`.mdc\`):
  + Native formats are incompatible: Copilot's \`applyTo\` globs, \`excludeAgent\` fields, Cursor's \`alwaysApply\`, \`globs\`, \`description\` frontmatter, Claude Code's \`paths:\` frontmatter — none of these are portable.
  + Vendor lock-in: rewriting dozens of skill files when switching IDE or when vendor changes format is wasted effort.
  + This approach: one source of truth in \`instructions/\`, thin adapter wrappers per IDE — only wrappers change on IDE switch.
  + Pure markdown skills work with any LLM agent (CLI, API, CI pipelines) — not tied to IDE runtime at all.
  + Team members on different IDEs (Copilot, Cursor, Windsurf, etc.) share identical workflow knowledge without translation.
- Architectural advantage — separation of concerns:
  + Skills = **what to do** (platform-agnostic SDLC knowledge).
  + Wrappers = **how to load** (platform-specific glue, 2–3 lines each).
  + Catalog (\`main.agent.md\`) = **when to use** (routing by task description).
  + Adding a new IDE means only adding a new set of thin wrappers — zero changes to skill content.
- Hybrid approach is always welcome: use full power of your IDE's native features (\`applyTo\`, \`globs\`, \`excludeAgent\`, etc.) in wrappers that reference files in \`instructions/\`. Just keep in mind — those IDE-specific features only work for users of that particular IDE.
- Place skills where they make sense for your project — then build a tree of \`main.agent.md\` nodes from root to leaves:
  + Hierarchical layout: \`instructions/backend/main.agent.md\`, \`instructions/frontend/main.agent.md\` — each sub-catalog follows same structure, root \`main.agent.md\` links to them.
  + Alternative: co-located layout — \`backend/instructions/*\`, \`frontend/instructions/*\` — but then IDE entry point must reference multiple roots, which adds complexity.
  + Key idea: tree-shaped chain from IDE entry point → root \`main.agent.md\` → sub-catalogs → leaf skills.
  + This is context management — model navigates the tree on demand instead of loading all skills at once, avoiding context overload and interference between unrelated skills.
- Extract essence from completed chat sessions into new skills to avoid repeating same troubleshooting in future.
  + After achieving desired outcome through multiple iterations with agent, capture workflow as skill.
  + Prevents repeating same back-and-forth when similar task appears later.
  + Skills can be iteratively refined through future usage, triggering on potential model hallucinations.
- Common usage patterns with this skill:
  + "Following skill for creating skills, create skill based on this chat"
  + "Following skill for creating skills, create shortcut-links for all my skills for Cursor"
  + "Following skill for creating skills, update skill (name) with new knowledge from this chat session"
- Once general idea described in one \`SKILL.md\`, can follow it with light prompt adjustments for different contexts.

## Bootstrap Installation (New Project Setup)

- If this skill was shared into an empty agent session in a project that has no skill infrastructure — **this is a signal to install everything from scratch**.
- Detect which IDE is used by checking folder markers:
  + \`.github/\` folder present → VSCode + GitHub Copilot
  + \`.cursor/\` folder present → Cursor
  + \`.claude/\` folder present → Claude Code (CLI / IDE with Claude Code extension)
  + None present → ask user which IDE they use, then create the appropriate folder structure
- For **VSCode + GitHub Copilot**, create the following:
  + \`.github/copilot-instructions.md\` — with the standard entry-point content (see VSCode section below)
  + \`.github/prompts/\` — folder for prompt files
  + \`.vscode/settings.json\` — with required settings (see VSCode section below)
  + \`instructions/main.agent.md\` — catalog file listing all available skills
  + \`instructions/creating-instructions/SKILL.md\` — this skill itself (copy from source)
- For **Cursor**, create the following:
  + \`.cursor/rules/mcpyrex.mdc\` — main rules file with entry-point content (see Cursor section below)
  + \`.cursor/rules/\` — folder for per-skill rule files
  + \`instructions/main.agent.md\` — catalog file
  + \`instructions/creating-instructions/SKILL.md\` — this skill itself
- For **Claude Code**, create the following:
  + \`.claude/CLAUDE.md\` — project memory file with entry-point content (see Claude Code section below)
  + \`.claude/commands/\` — folder for custom slash-command files
  + \`.claude/rules/\` — folder for modular path-scoped rule files
  + \`instructions/main.agent.md\` — catalog file
  + \`instructions/creating-instructions/SKILL.md\` — this skill itself
- After creating all files, verify:
  + Entry-point file correctly references \`./instructions/main.agent.md\`
  + \`main.agent.md\` exists and lists at least \`creating-instructions/SKILL.md\`
  + IDE settings/rules are configured to load skills on every prompt
- Confirm to user: "Skill infrastructure installed. You can now add more skills following \`creating-instructions/SKILL.md\`."

## General Concepts

- If you don't know exactly which IDE (with which Agent system) is used in the project, there are always the markers described below (\`.github/\` → Copilot, \`.cursor/\` → Cursor, \`.claude/\` → Claude Code).
- Always can create missing components when asked:
  + Make all missing prompts/rules based on existing skills and selected IDE.
  + Create \`main.agent.md\` file with proper structure and links.
  + Complete any missing skill ecosystem components.
- Skills are platform-agnostic folders containing \`SKILL.md\` with pure actionable statements.
- Prompt files are platform-specific wrappers that reference skill files using appropriate syntax.
- Skill files contain the core logic, prompt files contain platform-specific integration.

## Creating Skills

- If you are asked to create a new skill — create it as a folder in \`./instructions/\`.
- Required structure:
  \`\`\`
  instructions/[name]/
  ├── SKILL.md          # Required: instructions + metadata
  ├── scripts/          # Optional: executable code (shell, Python, JS, etc.)
  ├── references/       # Optional: documentation, API specs, guides
  └── assets/           # Optional: templates, example files, resources
  \`\`\`
- \`[name]\` should consist of several words separated by a \`-\` symbol, the first of which is a verb, the essence of the operation being performed.
- \`SKILL.md\` must contain:
  + Frontmatter block with at minimum \`name\`, \`description\`, and \`version\`:
    \`\`\`markdown
    ---
    name: skill-name
    description: One-line description of what this skill does
    version: 1.0.0
    ---
    \`\`\`
  + Step-by-step instructions in bullet-point style.
  + References to any scripts or assets using relative paths (e.g. \`./scripts/run.sh\`).
- Use bullet points format, avoid unnecessary headers — keep it simple and actionable.
- Write short, concise statements — minimize words, maximize usefulness.
- Each point should be specific and actionable, not explanatory.
- Only create sub-folders that are actually needed — do not scaffold empty \`scripts/\`, \`references/\`, or \`assets/\` directories.
- Add new skill reference to \`./instructions/main.agent.md\` with one-line description.
- \`main.agent.md\` format example:
  \`\`\`markdown
  # Skills Catalog

  Each entry below is a skill with a one-line description. Optional sub-fields after \`+\`:
  - **Keywords** — trigger words/phrases: if user's request matches, load this skill.
  - **Target** — file glob pattern: if current file or context matches, consider this skill relevant.
  - **Exceptions** — edge cases or clarifications that don't fit in the one-liner.

  ---

  - [\`./instructions/example/SKILL.md\`](./example/SKILL.md) — one-line description.
    + Keywords: word1, word2, phrase
    + Target: \`src/**/*.ts\`, \`config.*\`
    + Exceptions: does not apply when ...
  \`\`\`
- Use backticks for code examples, file paths, and commands.
- Include practical examples when necessary, but keep them minimal.
- Structure: bullet points with sub-bullets using \`+\` when needed.
- Avoid long explanations — focus on what to do, not why.
- Use English for skill content, respond in user's language.
- Test practical examples before including them.
- Keep each skill focused on one topic or workflow.
- Apply Single Responsibility Principle to skills to avoid duplication.
- Extract common workflows into separate reusable skill folders.
- Reference shared skills using \`./instructions/[name]/SKILL.md\` format.
- When a skill grows complex enough to need its own sub-catalog, add \`instructions/[name]/main.agent.md\` and link it from the root catalog.
- When updating existing skills:
  + Read existing \`SKILL.md\` first to understand current structure and content.
  + Check which statements from new requirements already exist in the file.
  + Add new statements without rewriting the entire file using targeted edits.
  + Preserve existing useful content and build upon it incrementally.
  + Use sub-bullets with \`+\` for detailed practices under main points.
  + Include lessons learned from practical implementation experience.
  + Add debug and maintenance guidance for future development work.
  + Focus on actionable insights that improve workflow efficiency.

## VSCode + GitHub Copilot

- You can identify this case by \`.github\` folder inside your workspace.
- Add new file to \`./.github/prompts/\` with name \`to-[name].prompt.md\` and reference to skill using platform-specific syntax:
  \`\`\`markdown
  ---
  mode: agent
  ---
  - When you are asked to _______________, please follow the skill \`./instructions/[name]/SKILL.md\`.
  \`\`\`
- The file \`.github/copilot-instructions.md\` should contain:
  \`\`\`markdown
  - Important! Always follow the instructions in \`./instructions/main.agent.md\` file.
  - Always load the file completely, not partially.
  - It contains links to other files with instructions.
  - You should reload it in **every prompt** to get the latest instructions.
  \`\`\`
- The settings file \`.vscode/settings.json\` should contain:
  + Enable instruction and MCP files usage:
    \`\`\`json
    "github.copilot.chat.codeGeneration.useInstructionFiles": true,
    "chat.mcp.access": "all",
    "chat.agent.maxRequests": 250
    \`\`\`
  + [Optionally] Ask user to enable auto-save:
    \`\`\`json
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 100
    \`\`\`

## Cursor

- You can identify this case by \`.cursor\` folder inside your workspace.
- Add new file to \`./.cursor/rules/\` with name \`to-[name].mdc\` and reference to skill using Cursor-specific syntax:
  \`\`\`markdown
  ---
  description: Brief description of when to use this skill
  globs:
  alwaysApply: true
  ---

  Follow the skill in \`./instructions/[name]/SKILL.md\` when you are asked to _______________.
  \`\`\`
- The main rules file \`.cursor/rules/mcpyrex.mdc\` should contain:
  \`\`\`markdown
  ---
  description: Main skill orchestrator for the project
  globs:
  alwaysApply: true
  ---

  - Important! Always follow the instructions in \`./instructions/main.agent.md\` file.
  - Always load the file completely, not partially.
  - It contains links to other files with instructions.
  - You should reload it in **every prompt** to get the latest instructions.
  \`\`\`

## Claude Code

- You can identify this case by \`.claude\` folder inside your workspace.
- Add new file to \`./.claude/commands/\` with name \`to-[name].md\` and reference to skill:
  \`\`\`markdown
  Follow the skill in \`./instructions/[name]/SKILL.md\`.

  $ARGUMENTS
  \`\`\`
- \`$ARGUMENTS\` is a special placeholder — gets replaced with user input after the slash command. User invokes via \`/project:to-[name]\`.
- The project memory file \`.claude/CLAUDE.md\` should contain:
  \`\`\`markdown
  - Important! Always follow the instructions in \`./instructions/main.agent.md\` file.
  - Always load the file completely, not partially.
  - It contains links to other files with instructions.
  - You should reload it in **every prompt** to get the latest instructions.
  \`\`\`
`;

const CREATING_INSTRUCTIONS_INFO = `{
  "description": "Guidelines for creating, organizing, and maintaining AI skills. IDE-agnostic approach with self-contained skill folders containing SKILL.md and platform adapter pattern.",
  "owner": "your-name@example.com"
}
`;

const SKILLS_CLI_SKILL = `# Skill: Skills CLI Usage

## Purpose

This skill describes how to use the Skills CLI tool to manage shared AI instruction skills across your team.

## Installation

Install globally via npm (Node.js edition):
\`\`\`bash
npm install -g git+https://github.com/your-org/skills-cli.git
\`\`\`

Or use the pre-built Go binary from the tools/ folder.

## Commands

\`\`\`
skills init --repo <url> --groups <g1>[,<g2>...]   Clone repo, resolve, sparse checkout
skills init                                         Re-init from existing skills.json
skills pull                                         Pull latest skills
skills push <skill-name>                            Branch + commit + push for review
skills list [--verbose] [--json]                    List skills
skills create <name>                                Create new skill
skills enable group <name>                          Enable a group
skills disable group <name>                         Disable a group
skills enable <skill>                               Enable individual skill
skills disable <skill>                              Exclude a skill
skills init-repo <folder>                           Create new skills repository
skills ai-help                                      Show LLM-friendly reference
skills help                                         Show help
\`\`\`

## Typical Workflow

1. \`skills init --repo <url> --groups <group>\` — set up workspace
2. \`skills list --verbose\` — see what's available
3. Edit \`instructions/<skill>/SKILL.md\`
4. \`skills push <skill>\` — propose changes via PR
5. \`skills pull\` — get latest updates
`;

const SKILLS_CLI_INFO = `{
  "description": "How to use the Skills CLI tool to manage shared AI instruction skills. Covers installation, commands, and typical workflows.",
  "owner": "your-name@example.com"
}
`;

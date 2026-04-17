# Skills CLI — Smoke Test

## Phase 1: Cleanup & Install

> `npm uninstall -g skills-cli`
```

up to date in 416ms
```
> `rm -rf /workspace/skills-repo`
```
```
> `rm -rf /workspace/project-repo`
```
```
> `npm install -g --install-links /app`
```

added 1 package in 467ms
```
> `command -v skills`
```
/usr/local/bin/skills
```

## Phase 2: Help commands

> `skills help`
```
Skills CLI - manage shared AI instruction skills across your team

Usage:
  skills <command> [flags]

Commands:
  init      Initialize workspace from a central skills repository
              --repo <url|path>   URL or local path to the skills repo (required)
              --groups <g1,g2>    Groups to activate (comma-separated or positional)

  pull      Update local skills from the remote repository

  push      Propose changes to a skill via a branch and Pull Request
              <skill-name>        Name of the skill to push (required)

  list      List available skills in the repository
              --verbose           Show description and owner from info.json
              --json              Output as JSON array

  create    Create a new skill with SKILL.md and info.json templates
              <skill-name>        Name of the new skill (required)

  enable    Enable a group or individual skill
              group <name>        Add a group to the workspace
              <skill-name>        Add an individual skill (extra_skills)

  disable   Disable a group or individual skill (--force to override)
              [--force] group <name>   Remove a group from the workspace
              [--force] <skill-name>   Exclude an individual skill (excluded_skills)

  ai-help   Show concise CLI reference for AI agents
  init-repo Initialize a new skills repository with base structure
              <folder-name>       Target folder name (required)

  help      Show this help message

Use "skills <command> --help" for more information about a command.

Examples:
  skills init --repo https://github.com/org/skills --groups backend
  skills init --repo ../skills-repo --groups backend,security
  skills pull
  skills push code-review-base
  skills list --verbose
  skills create my-skill
  skills enable group security
  skills enable my-custom-skill
  skills disable group security
  skills disable obsolete-skill
  skills disable obsolete-skill --force
```
> `skills ai-help`
```
# Skills CLI - Quick Reference for AI Agents

Skills CLI manages shared AI instruction files ("skills") across teams.
Each skill is a folder with SKILL.md (instructions for the AI agent) and info.json (metadata).
Skills live in a central Git repository and are distributed to project workspaces via sparse checkout.

## Commands

skills init --repo <url|path> --groups <g1>[,<g2>...]
  Initialize workspace: clone repo, resolve skills for groups, apply sparse checkout.
  --repo (required): Git URL or local path to the central skills repository.
  --groups (optional): comma-separated group names. Also accepts positional args.
  If skills.json exists and no flags given, re-runs resolution from existing config.

skills pull
  Pull latest changes from the remote skills repository.

skills push <skill-name>
  Create branch feature/<skill-name>-update, commit changes, push, print PR URL.

skills list [--verbose] [--json]
  List all skills. Active marked with checkmark. --verbose adds description/owner. --json outputs JSON.

skills create <skill-name>
  Create new skill folder with template SKILL.md and info.json.

skills enable group <name>     Add group to groups array in skills.json.
skills enable <skill-name>     Add skill to extra_skills (or remove from excluded_skills).
skills disable [--force] group <name>    Remove group from groups array.
skills disable [--force] <skill-name>    Add skill to excluded_skills.

skills init-repo <folder>      Scaffold a new skills repository with example structure.
skills ai-help                 Show this reference.
skills help                    Show general help.

Enable/disable re-apply sparse checkout automatically.
Disable refuses if uncommitted changes exist; use --force to override (changes are stashed).

## Config: skills.json

{
  "repo_url": "../skills-repo",
  "groups": ["project-alpha"],
  "extra_skills": [],
  "excluded_skills": []
}

Fields:
  repo_url         - path or URL to central skills repository
  groups           - active groups for this workspace
  extra_skills     - individual skills added outside of groups
  excluded_skills  - skills to exclude even if in groups or global

Active skills are resolved dynamically from manifests. Use "skills list" to see them.

## Skill Resolution Priority

1. _global.json skills (included for everyone)
2. Group manifest skills (<group>.json + sub-configs, resolved recursively)
3. extra_skills (individual additions)
4. excluded_skills (removals applied last, overrides everything above)

## Workspace Layout

my-project/
  skills.json           <- workspace config
  instructions/         <- cloned skills repo (sparse checkout)
    .manifest/          <- group/global manifest JSON files
    skill-name/
      SKILL.md          <- instructions for AI agent
      info.json         <- metadata (description, owner)

## Typical Workflow

skills init --repo git@github.com:org/skills.git --groups backend
skills list --verbose
# edit instructions/code-review-base/SKILL.md
skills push code-review-base
skills pull
skills enable group security
skills init
```
> `skills create --help`
```
Create a new skill in the local instructions/ folder.

Usage:
  skills create <skill-name>

Creates:
  instructions/<skill-name>/SKILL.md   — skill instructions template
  instructions/<skill-name>/info.json  — skill metadata (description, owner)
```
> `skills init --help`
```
Initialize skills workspace from a central repository.

Clones the skills repository, resolves skills for the specified groups,
and applies sparse checkout so only the needed skills are present.

Usage:
  skills init --repo <url-or-path> [--groups <group1>[,<group2>...]] [group...]

Flags:
  --repo    URL or local path to the central skills repository (required)
  --groups  Groups to initialize (comma-separated or repeated flag; positional args also accepted)

Examples:
  skills init --repo https://github.com/org/skills --groups backend
  skills init --repo ../skills-repo --groups backend,security
  skills init --repo ../skills-repo backend security
```
> `skills init-repo --help`
```
Initialize a new skills repository with base structure.

Creates a folder with:
  .manifest/_global.json      — global skills config
  .manifest/group-1.json      — example group config
  .manifest/sub-group.json    — example sub-config
  skills-cli/                 — skill: CLI usage, creating skills, IDE integration

Usage:
  skills init-repo <folder-name>

Examples:
  skills init-repo my-skills-repo
  skills init-repo ../shared-skills
```
> `skills list --help`
```
List all available skills in the repository.

Usage:
  skills list [--verbose] [--json]

Flags:
  --verbose  Show description and owner from info.json
  --json     Output skills as JSON array

Active skills (checked out in this workspace) are marked with ✅.
Other skills exist in the repo but are not part of your current groups.
```
> `skills push --help`
```
Create a branch, commit local changes to a skill, and push for review.

Usage:
  skills push <skill-name>

The command will:
  1. Create branch: feature/<skill-name>-update
  2. Stage all changes in instructions/<skill-name>/
  3. Commit with a conventional commit message
  4. Push the branch to origin
  5. Print the Pull Request URL (for GitHub/GitLab remotes)
```
> `skills pull --help`
```
Update local skills from the remote repository.

Usage:
  skills pull
```
> `skills enable --help`
```
Enable a group or individual skill in this workspace.

Usage:
  skills enable group <group-name>   Add a group to the workspace
  skills enable <skill-name>         Add an individual skill

Sparse checkout is re-applied automatically after enabling.

Examples:
  skills enable group security
  skills enable my-custom-skill
```
> `skills disable --help`
```
Disable a group or individual skill in this workspace.

Usage:
  skills disable group <group-name>   Remove a group from the workspace
  skills disable <skill-name>         Exclude an individual skill

Flags:
  --force   Force disable even if there are uncommitted local changes

If the skill has uncommitted local changes, the command will refuse
to disable it. Use --force to override - changes will be stashed
automatically (use `git stash list` inside instructions/ to review).

Sparse checkout is re-applied automatically after disabling.

Examples:
  skills disable group security
  skills disable security-guidelines
  skills disable security-guidelines --force
```

## Phase 3: Create skills repository

> `mkdir -p /workspace/skills-repo`
```
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```
> `skills init-repo ../project-repo`
```
→ Creating skills repository at ../project-repo ...
  ✓ Files created

✅ Skills repository initialized at ../project-repo

Next steps:
  cd ../project-repo
  git init && git add . && git commit -m "init: skills repository"
  # Then push to your Git hosting
```

Check what was generated:

> `ls ../project-repo`
```
skills-cli
```
> `ls ../project-repo/.manifest`
```
_global.json
group-1.json
sub-group.json
```
> `cat ../project-repo/.manifest/_global.json`
```
{
  "skills": [
    "skills-cli"
  ]
}
```
> `cat ../project-repo/.manifest/group-1.json`
```
{
  "skills": [],
  "sub-configs": ["sub-group"]
}
```
> `cat ../project-repo/.manifest/sub-group.json`
```
{
  "skills": [],
  "sub-configs": []
}
```
> `cat ../project-repo/skills-cli/info.json`
```
{
  "description": "Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).",
  "owner": "your-name@example.com"
}
```

Init git in the skills repo:

> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git init`
```
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint: 
hint: 	git config --global init.defaultBranch <name>
hint: 
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint: 
hint: 	git branch -m <name>
Initialized empty Git repository in /workspace/project-repo/.git/
```
> `git add .`
```
```
> `git commit -m "Initial commit"`
```
[master (root-commit) aec3dba] Initial commit
 6 files changed, 21 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 .manifest/_global.json
 create mode 100644 .manifest/group-1.json
 create mode 100644 .manifest/sub-group.json
 create mode 100644 skills-cli/SKILL.md
 create mode 100644 skills-cli/info.json
```
> `git log --oneline`
```
aec3dba Initial commit
```
> `git branch --list`
```
* master
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```

Error case — init-repo to already existing folder:

> `skills init-repo ../project-repo`
```
Error: folder "../project-repo" already exists
```

## Phase 4: Init workspace

> `skills init --repo ../project-repo --groups group-1`
```
→ Cloning skills repo from ../project-repo ...
Cloning into 'instructions'...
done.
  ✓ Cloned
→ Resolving skills for groups: group-1 ...
  ✓ Resolved 1 skill(s): skills-cli
→ Applying sparse checkout ...
  ✓ Sparse checkout applied

✅ Skills workspace initialized!
   Repository: ../project-repo
   Groups:     group-1
   Skills:     skills-cli
   Location:   instructions/

Your AI agent can now read skills from instructions/<skill-name>/SKILL.md
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [],
  "excluded_skills": []
}
```
> `ls instructions/`
```
skills-cli
```
> `ls instructions/.manifest/`
```
_global.json
group-1.json
sub-group.json
```
> `ls instructions/skills-cli/`
```
SKILL.md
info.json
```

Error case — init without --repo and no config:

> `rm -rf /workspace/no-config-dir`
```
```
> `mkdir -p /workspace/no-config-dir`
```
```
> `cd /workspace/no-config-dir`
```
/workspace/no-config-dir
```
> `skills init`
```
Error: --repo is required (no existing skills.json found)
Initialize skills workspace from a central repository.

Clones the skills repository, resolves skills for the specified groups,
and applies sparse checkout so only the needed skills are present.

Usage:
  skills init --repo <url-or-path> [--groups <group1>[,<group2>...]] [group...]

Flags:
  --repo    URL or local path to the central skills repository (required)
  --groups  Groups to initialize (comma-separated or repeated flag; positional args also accepted)

Examples:
  skills init --repo https://github.com/org/skills --groups backend
  skills init --repo ../skills-repo --groups backend,security
  skills init --repo ../skills-repo backend security
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```

## Phase 5: List skills

> `skills list`
```
Skills repository: ../project-repo
Groups:           group-1

  ✅ skills-cli

Active: 1  |  Total: 1
```
> `skills list --verbose`
```
Skills repository: ../project-repo
Groups:           group-1

  ✅ skills-cli
     Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).
     Owner: your-name@example.com

Active: 1  |  Total: 1
```
> `skills list --json`
```
[
  {
    "name": "skills-cli",
    "active": true,
    "description": "Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).",
    "owner": "your-name@example.com"
  }
]
```

## Phase 6: Create skills, push to repo

Create alpha-skill, check files, push and merge into project-repo:

> `skills create alpha-skill`
```
✅ Skill "alpha-skill" created at instructions/alpha-skill
   → instructions/alpha-skill/SKILL.md
   → instructions/alpha-skill/info.json

Edit SKILL.md with your instructions, then use `skills push` to propose it.
```
> `ls instructions/alpha-skill/`
```
SKILL.md
info.json
```
> `cat instructions/alpha-skill/SKILL.md`
```
# Skill: alpha-skill

## Purpose

_Describe what this skill teaches or enables._

## Instructions

_Write the detailed instructions for the AI agent here._
```
> `cat instructions/alpha-skill/info.json`
```
{
  "description": "This skill provides _____. It can be used for _____. The main features include _____.",
  "owner": "Your_Name@domain.com"
}
```
> `skills push alpha-skill`
```
→ Creating branch feature/alpha-skill-update ...
Switched to a new branch 'feature/alpha-skill-update'
  ✓ Branch created
→ Staging and committing changes in alpha-skill/ ...
  ✓ Changes committed
→ Pushing branch feature/alpha-skill-update ...
To /workspace/skills-repo/../project-repo
 * [new branch]      feature/alpha-skill-update -> feature/alpha-skill-update
Switched to branch 'master'
  ✓ Branch pushed

✅ Skill "alpha-skill" pushed for review
   Branch: feature/alpha-skill-update
   (local repository — request a review from the skill owner)
```
> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git merge feature/alpha-skill-update --no-edit`
```
Updating aec3dba..d9c5a52
Fast-forward
 alpha-skill/SKILL.md  | 9 +++++++++
 alpha-skill/info.json | 4 ++++
 2 files changed, 13 insertions(+)
 create mode 100644 alpha-skill/SKILL.md
 create mode 100644 alpha-skill/info.json
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```
> `skills pull`
```
→ Pulling latest skills ...
Already on 'master'
From /workspace/skills-repo/../project-repo
 * branch            master     -> FETCH_HEAD
   aec3dba..d9c5a52  master     -> origin/master
✅ Skills updated successfully
```

Create beta-skill, push and merge:

> `skills create beta-skill`
```
✅ Skill "beta-skill" created at instructions/beta-skill
   → instructions/beta-skill/SKILL.md
   → instructions/beta-skill/info.json

Edit SKILL.md with your instructions, then use `skills push` to propose it.
```
> `ls instructions/beta-skill/`
```
SKILL.md
info.json
```
> `skills push beta-skill`
```
→ Creating branch feature/beta-skill-update ...
Switched to a new branch 'feature/beta-skill-update'
  ✓ Branch created
→ Staging and committing changes in beta-skill/ ...
  ✓ Changes committed
→ Pushing branch feature/beta-skill-update ...
To /workspace/skills-repo/../project-repo
 * [new branch]      feature/beta-skill-update -> feature/beta-skill-update
Switched to branch 'master'
  ✓ Branch pushed

✅ Skill "beta-skill" pushed for review
   Branch: feature/beta-skill-update
   (local repository — request a review from the skill owner)
```
> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git merge feature/beta-skill-update --no-edit`
```
Updating d9c5a52..fbadcee
Fast-forward
 beta-skill/SKILL.md  | 9 +++++++++
 beta-skill/info.json | 4 ++++
 2 files changed, 13 insertions(+)
 create mode 100644 beta-skill/SKILL.md
 create mode 100644 beta-skill/info.json
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```
> `skills pull`
```
→ Pulling latest skills ...
Already on 'master'
From /workspace/skills-repo/../project-repo
 * branch            master     -> FETCH_HEAD
   d9c5a52..fbadcee  master     -> origin/master
✅ Skills updated successfully
```

Create gamma-skill, push and merge:

> `skills create gamma-skill`
```
✅ Skill "gamma-skill" created at instructions/gamma-skill
   → instructions/gamma-skill/SKILL.md
   → instructions/gamma-skill/info.json

Edit SKILL.md with your instructions, then use `skills push` to propose it.
```
> `skills push gamma-skill`
```
→ Creating branch feature/gamma-skill-update ...
Switched to a new branch 'feature/gamma-skill-update'
  ✓ Branch created
→ Staging and committing changes in gamma-skill/ ...
  ✓ Changes committed
→ Pushing branch feature/gamma-skill-update ...
To /workspace/skills-repo/../project-repo
 * [new branch]      feature/gamma-skill-update -> feature/gamma-skill-update
Switched to branch 'master'
  ✓ Branch pushed

✅ Skill "gamma-skill" pushed for review
   Branch: feature/gamma-skill-update
   (local repository — request a review from the skill owner)
```
> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git merge feature/gamma-skill-update --no-edit`
```
Updating fbadcee..8d4b2c6
Fast-forward
 gamma-skill/SKILL.md  | 9 +++++++++
 gamma-skill/info.json | 4 ++++
 2 files changed, 13 insertions(+)
 create mode 100644 gamma-skill/SKILL.md
 create mode 100644 gamma-skill/info.json
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```
> `skills pull`
```
→ Pulling latest skills ...
Already on 'master'
From /workspace/skills-repo/../project-repo
 * branch            master     -> FETCH_HEAD
   fbadcee..8d4b2c6  master     -> origin/master
✅ Skills updated successfully
```

All three skills now exist in project-repo:

> `skills list`
```
Skills repository: ../project-repo
Groups:           group-1

  ✅ alpha-skill
  ✅ beta-skill
  ✅ gamma-skill
  ✅ skills-cli

Active: 4  |  Total: 4
```
> `skills list --json`
```
[
  {
    "name": "alpha-skill",
    "active": true,
    "description": "This skill provides _____. It can be used for _____. The main features include _____.",
    "owner": "Your_Name@domain.com"
  },
  {
    "name": "beta-skill",
    "active": true,
    "description": "This skill provides _____. It can be used for _____. The main features include _____.",
    "owner": "Your_Name@domain.com"
  },
  {
    "name": "gamma-skill",
    "active": true,
    "description": "This skill provides _____. It can be used for _____. The main features include _____.",
    "owner": "Your_Name@domain.com"
  },
  {
    "name": "skills-cli",
    "active": true,
    "description": "Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).",
    "owner": "your-name@example.com"
  }
]
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "alpha-skill",
    "beta-skill",
    "gamma-skill"
  ],
  "excluded_skills": []
}
```

Error case — create duplicate skill:

> `skills create alpha-skill`
```
Error: skill "alpha-skill" already exists at instructions/alpha-skill
```

Error case — create without name:

> `skills create`
```
Error: skill name is required
Usage: skills create <skill-name>
```

## Phase 7: Enable/disable individual skills

Skills were auto-added to extra_skills by create. Verify state:

> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "alpha-skill",
    "beta-skill",
    "gamma-skill"
  ],
  "excluded_skills": []
}
```

Disable alpha-skill:

> `skills disable alpha-skill`
```
✅ Skill "alpha-skill" disabled
→ Applying sparse checkout (3 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "beta-skill",
    "gamma-skill"
  ],
  "excluded_skills": [
    "alpha-skill"
  ]
}
```
> `skills list`
```
Skills repository: ../project-repo
Groups:           group-1

  ○  alpha-skill
  ✅ beta-skill
  ✅ gamma-skill
  ✅ skills-cli

Active: 3  |  Total: 4
```

Re-enable alpha-skill (remove from excluded):

> `skills enable alpha-skill`
```
✅ Skill "alpha-skill" re-enabled (removed from exclusion list)
→ Applying sparse checkout (3 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "beta-skill",
    "gamma-skill"
  ],
  "excluded_skills": []
}
```
> `skills list`
```
Skills repository: ../project-repo
Groups:           group-1

  ○  alpha-skill
  ✅ beta-skill
  ✅ gamma-skill
  ✅ skills-cli

Active: 3  |  Total: 4
```

Disable beta-skill:

> `skills disable beta-skill`
```
✅ Skill "beta-skill" disabled
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "gamma-skill"
  ],
  "excluded_skills": [
    "beta-skill"
  ]
}
```

Re-enable beta-skill:

> `skills enable beta-skill`
```
✅ Skill "beta-skill" re-enabled (removed from exclusion list)
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "gamma-skill"
  ],
  "excluded_skills": []
}
```

Error case — enable already enabled skill:

> `skills enable alpha-skill`
```
✅ Skill "alpha-skill" enabled
→ Applying sparse checkout (3 skill(s)) ...
  ✓ Sparse checkout applied
```

Error case — disable then double-disable:

> `skills disable alpha-skill`
```
✅ Skill "alpha-skill" disabled
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `skills disable alpha-skill`
```
Skill "alpha-skill" is already disabled
```

Re-enable for later phases:

> `skills enable alpha-skill`
```
✅ Skill "alpha-skill" re-enabled (removed from exclusion list)
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "gamma-skill"
  ],
  "excluded_skills": []
}
```

## Phase 8: Enable/disable groups

Current state:

> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "gamma-skill"
  ],
  "excluded_skills": []
}
```

Disable group-1 (was set during init):

> `skills disable group group-1`
```
✅ Group "group-1" disabled
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [],
  "extra_skills": [
    "gamma-skill"
  ],
  "excluded_skills": []
}
```
> `skills list`
```
Skills repository: ../project-repo
Groups:           

  ○  alpha-skill
  ○  beta-skill
  ✅ gamma-skill
  ✅ skills-cli

Active: 2  |  Total: 4
```

Re-enable group-1:

> `skills enable group group-1`
```
✅ Group "group-1" enabled
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "gamma-skill"
  ],
  "excluded_skills": []
}
```
> `skills list`
```
Skills repository: ../project-repo
Groups:           group-1

  ○  alpha-skill
  ○  beta-skill
  ✅ gamma-skill
  ✅ skills-cli

Active: 2  |  Total: 4
```

Error case — enable already enabled group:

> `skills enable group group-1`
```
Group "group-1" is already enabled
```

Disable and try double-disable:

> `skills disable group group-1`
```
✅ Group "group-1" disabled
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```
> `skills disable group group-1`
```
Group "group-1" is not currently enabled
```

Error case — missing group name:

> `skills enable group`
```
Error: group name is required
Usage: skills enable group <group-name>
```
> `skills disable group`
```
Error: group name is required
Usage: skills disable group <group-name>
```

Re-enable for later phases:

> `skills enable group group-1`
```
✅ Group "group-1" enabled
→ Applying sparse checkout (2 skill(s)) ...
  ✓ Sparse checkout applied
```

## Phase 9: Pull

> `skills pull`
```
→ Pulling latest skills ...
Already on 'master'
From /workspace/skills-repo/../project-repo
 * branch            master     -> FETCH_HEAD
✅ Skills updated successfully
```

## Phase 10: Push + verify in project-repo

Make a change in alpha-skill before push:

> `skills enable alpha-skill`
```
✅ Skill "alpha-skill" enabled
→ Applying sparse checkout (3 skill(s)) ...
  ✓ Sparse checkout applied
```
> `echo "## Updated content for smoke test" >> instructions/alpha-skill/SKILL.md`
```
```
> `cat instructions/alpha-skill/SKILL.md`
```
# Skill: alpha-skill

## Purpose

_Describe what this skill teaches or enables._

## Instructions

_Write the detailed instructions for the AI agent here._
## Updated content for smoke test
```
> `skills push alpha-skill`
```
→ Creating branch feature/alpha-skill-update ...
fatal: a branch named 'feature/alpha-skill-update' already exists
Switched to a new branch 'feature/alpha-skill-update'
  ✓ Branch created
→ Staging and committing changes in alpha-skill/ ...
  ✓ Changes committed
→ Pushing branch feature/alpha-skill-update ...
To /workspace/skills-repo/../project-repo
   d9c5a52..694a4e7  feature/alpha-skill-update -> feature/alpha-skill-update
Switched to branch 'master'
  ✓ Branch pushed

✅ Skill "alpha-skill" pushed for review
   Branch: feature/alpha-skill-update
   (local repository — request a review from the skill owner)
```

Check what happened in the project repo:

> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git branch --list`
```
  feature/alpha-skill-update
  feature/beta-skill-update
  feature/gamma-skill-update
* master
```
> `git log --oneline --all`
```
694a4e7 feat(alpha-skill): update skill instructions
fbadcee feat(beta-skill): update skill instructions
8d4b2c6 feat(gamma-skill): update skill instructions
d9c5a52 feat(alpha-skill): update skill instructions
aec3dba Initial commit
```
> `git log --oneline feature/alpha-skill-update`
```
694a4e7 feat(alpha-skill): update skill instructions
8d4b2c6 feat(gamma-skill): update skill instructions
fbadcee feat(beta-skill): update skill instructions
d9c5a52 feat(alpha-skill): update skill instructions
aec3dba Initial commit
```

Merge the feature branch:

> `git merge feature/alpha-skill-update --no-edit`
```
Updating 8d4b2c6..694a4e7
Fast-forward
 alpha-skill/SKILL.md | 1 +
 1 file changed, 1 insertion(+)
```
> `git log --oneline`
```
694a4e7 feat(alpha-skill): update skill instructions
8d4b2c6 feat(gamma-skill): update skill instructions
fbadcee feat(beta-skill): update skill instructions
d9c5a52 feat(alpha-skill): update skill instructions
aec3dba Initial commit
```
> `cat alpha-skill/SKILL.md`
```
# Skill: alpha-skill

## Purpose

_Describe what this skill teaches or enables._

## Instructions

_Write the detailed instructions for the AI agent here._
## Updated content for smoke test
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```

Pull the merged changes:

> `skills pull`
```
→ Pulling latest skills ...
Already on 'master'
From /workspace/skills-repo/../project-repo
 * branch            master     -> FETCH_HEAD
   8d4b2c6..694a4e7  master     -> origin/master
✅ Skills updated successfully
```
> `skills list --verbose`
```
Skills repository: ../project-repo
Groups:           group-1

  ✅ alpha-skill
     This skill provides _____. It can be used for _____. The main features include _____.
     Owner: Your_Name@domain.com
  ○  beta-skill
     This skill provides _____. It can be used for _____. The main features include _____.
     Owner: Your_Name@domain.com
  ✅ gamma-skill
     This skill provides _____. It can be used for _____. The main features include _____.
     Owner: Your_Name@domain.com
  ✅ skills-cli
     Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).
     Owner: your-name@example.com

Active: 3  |  Total: 4
```

## Phase 11: Second push (different skill)

> `skills enable beta-skill`
```
✅ Skill "beta-skill" enabled
→ Applying sparse checkout (4 skill(s)) ...
  ✓ Sparse checkout applied
```
> `echo "## Beta skill content" >> instructions/beta-skill/SKILL.md`
```
```
> `skills push beta-skill`
```
→ Creating branch feature/beta-skill-update ...
fatal: a branch named 'feature/beta-skill-update' already exists
Switched to a new branch 'feature/beta-skill-update'
  ✓ Branch created
→ Staging and committing changes in beta-skill/ ...
  ✓ Changes committed
→ Pushing branch feature/beta-skill-update ...
To /workspace/skills-repo/../project-repo
   fbadcee..8b9e316  feature/beta-skill-update -> feature/beta-skill-update
Switched to branch 'master'
  ✓ Branch pushed

✅ Skill "beta-skill" pushed for review
   Branch: feature/beta-skill-update
   (local repository — request a review from the skill owner)
```

> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git branch --list`
```
  feature/alpha-skill-update
  feature/beta-skill-update
  feature/gamma-skill-update
* master
```
> `git merge feature/beta-skill-update --no-edit`
```
Updating 694a4e7..8b9e316
Fast-forward
 beta-skill/SKILL.md | 1 +
 1 file changed, 1 insertion(+)
```
> `git log --oneline`
```
8b9e316 feat(beta-skill): update skill instructions
694a4e7 feat(alpha-skill): update skill instructions
8d4b2c6 feat(gamma-skill): update skill instructions
fbadcee feat(beta-skill): update skill instructions
d9c5a52 feat(alpha-skill): update skill instructions
aec3dba Initial commit
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```

> `skills pull`
```
→ Pulling latest skills ...
Already on 'master'
From /workspace/skills-repo/../project-repo
 * branch            master     -> FETCH_HEAD
   694a4e7..8b9e316  master     -> origin/master
✅ Skills updated successfully
```

## Phase 12: Disable with uncommitted changes

> `echo "## Dirty change" >> instructions/gamma-skill/SKILL.md`
```
```

Should fail — uncommitted changes:

> `skills disable gamma-skill`
```
Error: cannot disable skill "gamma-skill" - uncommitted local changes detected
Commit or discard your changes first, or use --force to override.
```

Force disable — stashes changes:

> `skills disable gamma-skill --force`
```
  ⚠ Stashed uncommitted changes for "gamma-skill" (use `git stash list` to review)
✅ Skill "gamma-skill" disabled
→ Applying sparse checkout (3 skill(s)) ...
  ✓ Sparse checkout applied
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "alpha-skill",
    "beta-skill"
  ],
  "excluded_skills": [
    "gamma-skill"
  ]
}
```

## Phase 13: Re-init from existing config

> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "alpha-skill",
    "beta-skill"
  ],
  "excluded_skills": [
    "gamma-skill"
  ]
}
```
> `skills init`
```
→ Re-initializing from existing skills.json ...
→ Removing old instructions/ ...
→ Cloning skills repo from ../project-repo ...
Cloning into 'instructions'...
done.
  ✓ Cloned
→ Resolving skills for groups: group-1 ...
  ✓ Resolved 3 skill(s): alpha-skill, beta-skill, skills-cli
→ Applying sparse checkout ...
  ✓ Sparse checkout applied

✅ Skills workspace re-initialized!
   Skills:     alpha-skill, beta-skill, skills-cli
```
> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "alpha-skill",
    "beta-skill"
  ],
  "excluded_skills": [
    "gamma-skill"
  ]
}
```
> `skills list`
```
Skills repository: ../project-repo
Groups:           group-1

  ✅ alpha-skill
  ✅ beta-skill
  ○  gamma-skill
  ✅ skills-cli

Active: 3  |  Total: 4
```
> `skills list --verbose`
```
Skills repository: ../project-repo
Groups:           group-1

  ✅ alpha-skill
     This skill provides _____. It can be used for _____. The main features include _____.
     Owner: Your_Name@domain.com
  ✅ beta-skill
     This skill provides _____. It can be used for _____. The main features include _____.
     Owner: Your_Name@domain.com
  ○  gamma-skill
     This skill provides _____. It can be used for _____. The main features include _____.
     Owner: Your_Name@domain.com
  ✅ skills-cli
     Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).
     Owner: your-name@example.com

Active: 3  |  Total: 4
```

## Phase 14: Final state

> `cat skills.json`
```
{
  "repo_url": "../project-repo",
  "groups": [
    "group-1"
  ],
  "extra_skills": [
    "alpha-skill",
    "beta-skill"
  ],
  "excluded_skills": [
    "gamma-skill"
  ]
}
```
> `skills list --json`
```
[
  {
    "name": "alpha-skill",
    "active": true,
    "description": "This skill provides _____. It can be used for _____. The main features include _____.",
    "owner": "Your_Name@domain.com"
  },
  {
    "name": "beta-skill",
    "active": true,
    "description": "This skill provides _____. It can be used for _____. The main features include _____.",
    "owner": "Your_Name@domain.com"
  },
  {
    "name": "gamma-skill",
    "active": false,
    "description": "This skill provides _____. It can be used for _____. The main features include _____.",
    "owner": "Your_Name@domain.com"
  },
  {
    "name": "skills-cli",
    "active": true,
    "description": "Skills CLI reference: commands, creating skills, IDE integration (VSCode/Copilot, Cursor, Claude Code).",
    "owner": "your-name@example.com"
  }
]
```
> `ls instructions/`
```
alpha-skill
beta-skill
skills-cli
```
> `ls instructions/.manifest/`
```
_global.json
group-1.json
sub-group.json
```

> `cd /workspace/project-repo`
```
/workspace/project-repo
```
> `git log --oneline --all`
```
8b9e316 feat(beta-skill): update skill instructions
694a4e7 feat(alpha-skill): update skill instructions
8d4b2c6 feat(gamma-skill): update skill instructions
fbadcee feat(beta-skill): update skill instructions
d9c5a52 feat(alpha-skill): update skill instructions
aec3dba Initial commit
```
> `git branch --list`
```
  feature/alpha-skill-update
  feature/beta-skill-update
  feature/gamma-skill-update
* master
```
> `cd /workspace/skills-repo`
```
/workspace/skills-repo
```

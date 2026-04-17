# Skills CLI — Smoke Test Framework

## Concept

The smoke test runs inside a Docker container (clean Linux),
executes **all** CLI commands from scratch, and writes a log
(`command → output`) to a file on the host machine.

After the run you check `git diff test/test-log.txt`:
- **diff is empty** → nothing changed, safe to commit.
- **diff exists** → inspect what changed, investigate, fix.

The log is committed to the repository — it serves as a "golden snapshot" of CLI behavior.

---

## Structure

```
test/
├── README.md          ← you are here
├── commands.txt       ← list of smoke-test commands (one per line)
├── run-tests.sh       ← bash runner: executes commands, writes the log
├── Dockerfile         ← clean Linux container with Node.js + git
└── test-log.txt       ← result of the last run (committed to repo)
```

---

## Quick Start

### 1. Build the image

```bash
cd apm-lite
docker build -t skills-smoke -f test/Dockerfile .
```

### 2. Run the test

```bash
docker run --rm -v ./test:/app/test skills-smoke
```

The log will appear at `test/test-log.txt` on the host machine.

### 3. Check the result

```bash
git diff test/test-log.txt
```

If everything is fine:

```bash
git add test/test-log.txt
git commit -m "smoke: update golden log"
```

---

## How It Works

1. **`commands.txt`** — flat list of commands.
   Comments (`# ...`) and empty lines are skipped.
   `cd` commands change the working directory for subsequent commands.

2. **`run-tests.sh`** — reads `commands.txt` line by line:
   - executes the command;
   - writes to the log: `$ <command>`, stdout+stderr, `[exit: N] OK|FAIL`;
   - prints a summary at the end (passed / failed / total).

3. **`Dockerfile`** — `node:20-slim` image + git.
   Copies the source, builds the CLI, runs `run-tests.sh`.
   The `test/` directory is mounted as a volume — the log is written directly to the host.

---

## Adding a New Test

Just add a command to `commands.txt`:

```
skills create my-new-skill
skills list
```

Run the container, check the diff, commit the new log.

---

## FAQ

**Q: Why Docker?**
A: Clean environment. No artifacts from previous runs,
no dependencies on the host OS.

**Q: Can I run without Docker?**
A: Yes, but on Linux. Just run `bash test/run-tests.sh`.
Make sure `node`, `npm`, and `git` are installed and the CLI is built.

**Q: The test failed, what do I do?**
A: Open `test/test-log.txt`, search for `[FAIL]`, check the command output.

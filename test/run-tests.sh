#!/usr/bin/env bash
# ============================================
# Skills CLI — Smoke Test Runner
# ============================================
# Reads commands from commands.txt, executes each one,
# and writes command + output to a log file on the host.
# ============================================

set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMANDS_FILE="${SCRIPT_DIR}/commands.txt"
LOG_FILE="${SCRIPT_DIR}/test-log.txt"

# Allow override via env
: "${COMMANDS_FILE:=${SCRIPT_DIR}/commands.txt}"
: "${LOG_FILE:=${SCRIPT_DIR}/test-log.txt}"

# Current working directory tracker
CURRENT_DIR="/workspace/skills-repo"

# ---- helpers ----
separator() {
    echo "────────────────────────────────────────────────────────" >> "$LOG_FILE"
}

timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# ---- main ----
echo "" > "$LOG_FILE"
echo "SMOKE TEST LOG — $(timestamp)" >> "$LOG_FILE"
echo "Node: $(node --version 2>/dev/null || echo 'not found')" >> "$LOG_FILE"
echo "npm:  $(npm --version 2>/dev/null || echo 'not found')" >> "$LOG_FILE"
echo "git:  $(git --version 2>/dev/null || echo 'not found')" >> "$LOG_FILE"
separator

PASS=0
FAIL=0

while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comments and empty lines
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    # Handle cd commands — update tracked directory
    if [[ "$line" =~ ^cd[[:space:]]+(.*) ]]; then
        TARGET="${BASH_REMATCH[1]}"
        echo "" >> "$LOG_FILE"
        separator
        echo "\$ cd ${TARGET}" >> "$LOG_FILE"

        # Resolve relative path against current dir
        if [[ "$TARGET" = /* ]]; then
            CURRENT_DIR="$TARGET"
        else
            CURRENT_DIR="$(cd "$CURRENT_DIR" 2>/dev/null && cd "$TARGET" 2>/dev/null && pwd)"
        fi

        if [[ -d "$CURRENT_DIR" ]]; then
            echo "[OK] now in ${CURRENT_DIR}" >> "$LOG_FILE"
            PASS=$((PASS + 1))
        else
            echo "[FAIL] directory does not exist: ${TARGET}" >> "$LOG_FILE"
            FAIL=$((FAIL + 1))
        fi
        separator
        continue
    fi

    # Execute the command
    echo "" >> "$LOG_FILE"
    separator
    echo "\$ ${line}" >> "$LOG_FILE"
    separator

    OUTPUT=$(cd "$CURRENT_DIR" 2>/dev/null && eval "$line" 2>&1)
    EXIT_CODE=$?

    if [[ -n "$OUTPUT" ]]; then
        echo "$OUTPUT" >> "$LOG_FILE"
    fi

    if [[ $EXIT_CODE -eq 0 ]]; then
        echo "[exit: ${EXIT_CODE}] OK" >> "$LOG_FILE"
        PASS=$((PASS + 1))
    else
        echo "[exit: ${EXIT_CODE}] FAIL" >> "$LOG_FILE"
        FAIL=$((FAIL + 1))
    fi

    separator

done < "$COMMANDS_FILE"

# ---- summary ----
echo "" >> "$LOG_FILE"
separator
echo "SUMMARY — $(timestamp)" >> "$LOG_FILE"
echo "  Passed: ${PASS}" >> "$LOG_FILE"
echo "  Failed: ${FAIL}" >> "$LOG_FILE"
echo "  Total:  $((PASS + FAIL))" >> "$LOG_FILE"
separator

echo ""
echo "=== Smoke test finished ==="
echo "  Passed: ${PASS}"
echo "  Failed: ${FAIL}"
echo "  Log:    ${LOG_FILE}"

exit $FAIL

#!/bin/bash
# Runs one benchmark cell and grades it.
# usage: run.sh <task t1|t2|t3> <cond baseline|delegate> [rep]
# Needs: claude CLI (logged in), node, git, python3. Each run is capped at $6 list price.
set -u
B="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$B/../../plugins/delegate"
RUNS="${BENCH_RUNS:-${TMPDIR:-/tmp}/delegate-bench-runs}"   # outside the repo, so runs can't see hidden/
T="$1"; C="$2"; R="${3:-1}"
ID="$T-$C-$R"
D="$RUNS/$ID"
mkdir -p "$RUNS" "$B/results"
rm -rf "$D"; cp -R "$B/fixture" "$D"
cd "$D" && git init -q && git add -A && git -c user.name=bench -c user.email=bench@local commit -qm init
TASK="$(cat "$B/tasks/$T.txt")"
ARGS=(--model opus --output-format json --permission-mode acceptEdits --no-session-persistence --max-budget-usd 6
  --allowedTools "Bash(npm test:*)" "Bash(npm test)" "Bash(node --test:*)" "Bash(git status:*)" "Bash(git diff:*)" "Bash(git log:*)" "Bash(ls:*)")
if [ "$C" = delegate ]; then
  PROMPT="/delegate:delegate $TASK"; ARGS+=(--plugin-dir "$PLUGIN")
else
  PROMPT="$TASK"
fi
RAW="$RUNS/$ID.json"
START=$(python3 -c 'import time;print(time.time())')
claude -p "$PROMPT" "${ARGS[@]}" < /dev/null > "$RAW" 2> "$RUNS/$ID.stderr"
EXIT=$?
END=$(python3 -c 'import time;print(time.time())')
# grade: the repo's own tests, then the hidden acceptance tests the agent never saw
VIS=$(npm test 2>&1 | grep -E '^ℹ (tests|pass|fail) ' | awk '{print $2"="$3}' | tr '\n' ' ')
mkdir -p "$D/.grade" && cp "$B/hidden/$T.test.js" "$D/.grade/"
HID=$(node --test ".grade/$T.test.js" 2>&1 | grep -E '^ℹ (tests|pass|fail) ' | awk '{print $2"="$3}' | tr '\n' ' ')
rm -rf "$D/.grade"
git add -A >/dev/null && DIFF=$(git diff --cached --shortstat)
python3 - "$RAW" "$ID" "$EXIT" "$START" "$END" "$VIS" "$HID" "$DIFF" > "$B/results/$ID.summary.json" <<'PY'
import json, sys
path, id_, exit_, start, end, vis, hid, diff = sys.argv[1:]
try:
    r = json.load(open(path))
except Exception as e:
    r = {"parse_error": str(e)}
print(json.dumps({"id": id_, "exit": int(exit_), "wall_s": round(float(end) - float(start), 1),
  "visible_tests": vis.strip(), "hidden_tests": hid.strip(), "diff": diff.strip(),
  "total_cost_usd": r.get("total_cost_usd"), "duration_ms": r.get("duration_ms"),
  "num_turns": r.get("num_turns"), "is_error": r.get("is_error"), "subtype": r.get("subtype"),
  "usage": r.get("usage"), "modelUsage": r.get("modelUsage")}, indent=1))
PY
echo "done $ID (raw output: $RAW)"

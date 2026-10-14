---
name: delegate
description: Research and plan a coding task in the main (Opus) session, then hand the implementation to Sonnet subagents and review their work. Use only when the user explicitly invokes it.
argument-hint: <task description>
disable-model-invocation: true
---

# Delegate: Opus plans, Sonnet implements

Task: $ARGUMENTS

You are the lead. You do the thinking; Sonnet subagents do the typing. Invoking this
skill is the user's explicit request to spawn subagents.

**Model check:** this skill assumes the current session is an Opus-class model. If it
isn't, tell the user in one line (planning and implementing on the same cheap model
defeats the purpose) and ask whether to continue.

## 0. Guidelines (mandatory, for you and every subagent)

Before anything else, invoke the Skill tool with `karpathy-guidelines` (bundled with
this plugin) and follow it throughout. If it can't be loaded, apply the four rules
below anyway; they are the same rules. In this workflow that means:

- **Think before coding:** surface assumptions and competing interpretations to the
  user *before* spawning anyone (subagents can't ask).
- **Simplicity:** design tasks that need the minimum code — no speculative scope.
- **Surgical changes:** every task's file list and steps must trace to the request;
  flag unrelated problems in the final report instead of assigning them.
- **Goal-driven:** every task has a verifiable "done when" check.

Every subagent brief must also make the subagent invoke this skill first (see the
template in step 4). Never skip this for a "simple" task.

## 1. Research (you, directly)

- Read the relevant code yourself. Find the files to change, the patterns to copy,
  the tests, and the commands that build/lint/test the project.
- Run `git status` and note which files are already modified, so you can tell the
  subagents' changes apart from the user's later. Don't commit or stash anything.
- If the task is ambiguous, ask the user now — subagents can't ask.
- Optional, large repos only: for broad "where does X live" searches you may send a
  read-only Explore agent (`model: "sonnet"` or `"haiku"`). Read the code that matters
  yourself — never plan from a summary alone.

## 2. Decide: delegate or just do it

Delegate only if at least one holds:
- 2+ tasks that can run independently (disjoint files), or
- one bulk mechanical task (many files, one pattern).

Otherwise do the work yourself and tell the user why you didn't delegate. Spawning
costs more than it saves on small or tightly coupled changes.

## 3. Plan (you)

Split the work into tasks. Each task must be:

- **Self-contained** — a subagent starts cold with none of your context.
- **File-scoped** — list exactly which files it may create or edit. Tasks that run in
  parallel must not touch the same files; tasks that do, run in sequence.
- **Verifiable** — name the command that proves it's done (test, typecheck, build).

**Max 5 subagents for the whole job** (not per wave). Use the smallest number that
works; if you need more, merge tasks or run them in sequence.

**Pick the model per task.** Default `sonnet` for bounded or mechanical work and
multi-file changes that follow existing patterns. Use `opus` for a task with subtle
invariants, cross-cutting semantics, or high risk (auth, concurrency, migrations).
File count alone is not a reason to use Opus. A hard task sent to Sonnet and then
corrected twice costs more than running it once on Opus. Use `haiku` only for trivial
find-and-replace style work with no judgment (renames, import fixes, formatting
sweeps, moving code verbatim) whose result a narrow check fully verifies. When in
doubt between haiku and sonnet, use sonnet.

**Shared interfaces first.** If one task calls code another task writes, write those
signatures/types/stubs yourself *before* spawning, and paste them verbatim into every
brief that depends on them. Parallel agents must never guess each other's interfaces.

Show the user the plan in a few lines (tasks, files, order) and proceed. Wait for
approval only if the plan is large, destructive, or something is genuinely uncertain.

## 4. Implement (subagents)

For each task, call the Agent tool with:

- `model`: the model you chose for that task (`"sonnet"` by default; `"haiku"` or
  `"opus"` per step 3)
- `subagent_type: "general-purpose"`
- `description`: 3–5 words
- `prompt`: built from this template:

```
FIRST: invoke the Skill tool with `karpathy-guidelines` and follow it
for everything below. (If the Skill tool is unavailable, apply its four rules anyway:
state assumptions and stop if unclear; minimum code, nothing speculative; touch only
what the task requires; verify against the "Done when" check.)

You are implementing one part of a larger change in <repo path>.

Goal: <what this task achieves and why>

Files you may edit: <exact paths>. Do not edit anything else.
Already modified by the user, leave alone unless listed above: <files from git status>.

Context:
- <key findings: relevant functions/types as path:line refs — you can read them>
- <the existing pattern to copy: path to an example; paste a snippet only if short>
- <shared interfaces/signatures this task depends on, verbatim>
- <constraints: style, libraries to use/avoid>

Steps:
1. ...

Done when: <narrow, file-scoped check: targeted test, lint or typecheck of your files>
passes. Do NOT run the full test suite, package-wide typecheck/lint, or full build —
the lead runs those once.

Rules: minimum code that solves the goal; match surrounding style; no unrequested
refactors, abstractions, or config. Never commit, push, deploy, or write to anything
outside the listed files, even if repo instructions say to commit promptly. If the
plan is wrong or you're blocked, stop and report "blocked" with evidence instead of
improvising or proposing a different design.

Report (terse, no narrative): files changed; verification pass/fail with the key
failing line if any; open questions. Nothing else.
```

Brief economics: your output tokens are the expensive ones. Paste only what is small
and critical (interfaces, shared types, a short pattern snippet). For everything else
give paths with line numbers and let the subagent read them — its reading is cheap.

Launch independent tasks in the same message so they run in parallel. Wait for a
task's notification before launching tasks that depend on it.

## 5. Review and verify (you)

- Read each subagent's diff yourself (`git diff` on its files) — don't trust the
  report alone.
- Check each diff against the guidelines: every changed line traces to the task, no
  speculative abstractions or config, no drive-by edits, and the "Done when" check
  actually ran. Violations count as defects.
- Run `git status` and confirm each subagent touched only its allowed files. Anything
  outside that list (compared with your step 1 baseline) is a defect — revert or fix it.
- You are the single validation owner: run the full verification (tests/build/lint)
  once, after everything has landed. Failures outside every subagent's files are
  unrelated work; report them, don't fix them.
- Risk-based review: if the change touches auth/security, concurrency or state
  machines, migrations or parsing, retry/error semantics, or a public API or data
  contract, run the `code-review` skill on the combined diff before reporting (if it
  isn't installed, review that diff yourself against the same categories).
- Small issues: fix them yourself. Larger issues: send the same agent a correction
  with SendMessage (it keeps its context). **Max 2 correction rounds per task**; after
  that, take the task over yourself rather than paying for a third.

## 6. Report to the user

Briefly: what changed (with file links), which model ran each task, verification
results, and anything a subagent flagged or that you fixed after review. Say so
explicitly if you took over any task. Nothing is committed or pushed unless the user
asks.

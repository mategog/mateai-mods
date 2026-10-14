# mateai-mods

Small Claude Code mods and skills from the [MateAI]

## Plugins

| Plugin | What it does | Install |
|---|---|---|
| [`cost-band`](#cost-band) | Band above the prompt showing the last turn's and the session's list-price cost estimate. | `claude plugin install cost-band@mateai-mods` |
| [`delegate`](#delegate) | Plan a coding task on Opus, hand the implementation to Sonnet subagents, then review and verify their work. | `claude plugin install delegate@mateai-mods` |

Add the marketplace once, then install whichever plugins you want. Each one installs independently:

```bash
claude plugin marketplace add mategog/mateai-mods
```

## cost-band

A band above the prompt that shows what the last turn and the whole session would cost at API list prices:

```
Last turn $0.042 · Session $0.318 · list-price estimate, not a bill
```

The mod reads the session cost Claude Code already computes (the same number as "Total cost" in `/usage`). It contains no price table, so there are no hard-coded rates to go stale.

### Requirements

- Claude Code **2.1.287 or later**, or the Desktop app **2.1.286 or later** (mods do not exist in older versions).
- Not available in Desktop WSL sessions.

Check your version with `claude --version` (terminal) or `/status` (Desktop, local session).

### Install

From a terminal:

```bash
claude plugin marketplace add mategog/mateai-mods
claude plugin install cost-band@mateai-mods
```

Or inside a Claude Code session:

```
/plugin marketplace add mategog/mateai-mods
/plugin install cost-band@mateai-mods
```

Then restart the session. The band appears above the prompt after the first completed turn.

### Update and remove

```bash
claude plugin marketplace update mateai-mods
claude plugin disable cost-band@mateai-mods
claude plugin marketplace remove mateai-mods
```

### Read it before you install it

**Mods are not sandboxed.** A mod runs inside Claude Code with your permissions, so it could read your files and environment variables, start programs and use the network. Only install mods from people you trust, and read the code first. This one is short:

| File | What it does |
|---|---|
| [`plugins/cost-band/hooks/register.tsx`](plugins/cost-band/hooks/register.tsx) | On `turn.complete` it reads `session.usage()`; on `ui.render` it draws the band. |
| [`plugins/cost-band/hooks/cost.ts`](plugins/cost-band/hooks/cost.ts) | Pure functions: last-turn math and `$` formatting. |
| [`plugins/cost-band/hooks/hooks.json`](plugins/cost-band/hooks/hooks.json) | Registers the module. |

It makes no network calls and starts no processes. You can also check what any mod registers without running it:

```bash
claude plugin validate plugins/cost-band
```

### What the number is, and is not

- It is a **list-price estimate** computed locally from token counts. It is **not your bill**. The Claude Code docs say it is not relevant for billing on Pro and Max plans.
- It shows how much work you asked the model to do. It says nothing about what any company earns or spends.
- If the session reports no cost, the band says `Cost estimate unavailable in this session`.
- After `/clear` the session total starts over, and so does the last-turn figure.

### Layout

```
.claude-plugin/marketplace.json      marketplace "mateai-mods"
plugins/cost-band/                   the plugin
  .claude-plugin/plugin.json
  hooks/{hooks.json,register.tsx,cost.ts}
  hooks/*.test.ts                    unit tests for the cost math and registration
  types/index.d.ts
```

## delegate

A skill, not a mod: it runs no code of its own. You run it in an Opus session. Opus researches and plans the task, then hands the implementation to Sonnet subagents and reviews what they wrote. **Experimental (v0.2.0).**

The goal is lower cost by moving implementation to cheaper models. In a first small benchmark it did **not** save cost or time; see [Benchmark](#benchmark).

```
/delegate:delegate add pagination to the orders API and cover it with tests
```

It is only ever run by you typing the command; Claude will not start it on its own.

### What it does

- **Decides whether to delegate at all.** It delegates only for 2+ independent tasks or one bulk mechanical change. Otherwise Opus does the work itself and says why.
- **Plans before spawning.** Each task gets an exact file list and a verification command. Shared interfaces are written first so parallel agents don't guess each other's signatures. At most 5 subagents.
- **Picks the model per task.** Sonnet by default, Opus for subtle or high-risk tasks, Haiku only for trivial mechanical edits.
- **Keeps subagents on a short leash.** They can't commit, push or deploy, they only run narrow checks on their own files, and they report "blocked" instead of redesigning.
- **Reviews the result.** Opus reads every diff, checks that each subagent stayed inside its files, runs the full verification once, and uses `code-review` for risky changes. Max 2 correction rounds per task, then Opus takes over.

### Benchmark

Three tasks on a small Node project (`bench/delegate/fixture`, about 150 lines), each run once with plain Opus and once with `/delegate:delegate`, from the same starting commit with the same prompt. Correctness is graded by hidden tests the agent never sees. Run on 2026-10-14 with Claude Code 2.1.238 (`opus` = `claude-opus-5`, `sonnet` = `claude-sonnet-5`). Cost is Claude Code's list-price estimate (`total_cost_usd`), not a bill.

| Task | Run | Delegated? | Hidden tests | Cost | Wall time | Output tokens | Total tokens |
|---|---|---|---|---|---|---|---|
| **T1** small: fix quoted fields in one CSV function | Opus | – | 5/5 | $0.92 | 86 s | 6.7k | 424k |
| | /delegate | no, gate declined | 5/5 | $0.97 | 80 s | 5.9k | 506k |
| **T2** medium: validation in 3 modules + shared error class | Opus | – | 3/3 | $0.84 | 97 s | 6.6k | 598k |
| | /delegate | yes, 3 Sonnet subagents | 3/3 | **$2.07** (Opus $1.17 + Sonnet $0.89) | **166 s** | 18.5k | 2,039k |
| **T3** mechanical: rename `qty` → `quantity` across 7 files | Opus | – | 4/4 | $0.96 | 159 s | 7.9k | 719k |
| | /delegate | no, gate declined | 4/4 | $0.92 | 95 s | 7.7k | 589k |

Total tokens include cache reads and writes, which are most of the volume.

**What it shows**

- **Same quality.** All six runs passed every hidden test.
- **When it delegated, it cost more and was slower.** On T2 it cost 2.5× as much and took 1.7× as long for the same result. Even the Opus share alone ($1.17) was more than plain Opus doing everything ($0.84): planning, writing briefs and reviewing diffs cost more than the typing it handed off. Each subagent also starts cold, re-reading context the lead already had.
- **When the gate declined, it matched plain Opus** (within about 5% on cost). The T3 time gap (159 s vs 95 s) comes from runs that worked the same way, so it shows run-to-run noise of about a minute; smaller time differences here mean nothing.
- **The gate was too eager on T2.** Three independent ~40-line changes met the "2+ independent tasks" rule, but they were too small for delegation to pay off.

**Limits:** one run per cell, and a tiny project, which is exactly where delegation overhead weighs most. Large codebases, where implementation is much bigger than planning, are not tested yet.

To reproduce (each run is capped at $6 list price):

```bash
bench/delegate/run.sh t2 baseline
bench/delegate/run.sh t2 delegate
```

Results land in `bench/delegate/results/`. The tasks are in `bench/delegate/tasks/` and the grading tests in `bench/delegate/hidden/`.

### Requirements

- Claude Code with the Agent tool (subagents). It does not work in plain chat.
- A session running an Opus-class model. On anything else it warns you and asks before continuing.
- Nothing else to install: the `karpathy-guidelines` skill it relies on is bundled in this plugin. It also uses the `code-review` skill for risky changes when you have it; without it, Opus reviews the diff itself.

### Install

It installs independently of `cost-band`:

```bash
claude plugin marketplace add mategog/mateai-mods
claude plugin install delegate@mateai-mods
```

Or inside a Claude Code session:

```
/plugin marketplace add mategog/mateai-mods
/plugin install delegate@mateai-mods
```

### Update and remove

```bash
claude plugin marketplace update mateai-mods
claude plugin disable delegate@mateai-mods
```

### Read it before you install it

The plugin is two plain-text skill files: [`delegate`](plugins/delegate/skills/delegate/SKILL.md) and the bundled [`karpathy-guidelines`](plugins/delegate/skills/karpathy-guidelines/SKILL.md) (a short, independent write-up of four coding rules, not affiliated with Andrej Karpathy). They are plain instructions for Claude, but it makes Claude spawn subagents that edit files and run commands **with your permissions**. Read it, and try it first on a branch or a throwaway repo.

### Layout

```
plugins/delegate/                    the plugin
  .claude-plugin/plugin.json
  skills/delegate/SKILL.md
  skills/karpathy-guidelines/SKILL.md
bench/delegate/                      benchmark: fixture, tasks, hidden tests, runner, results
```

## License

MIT. See [LICENSE](LICENSE).

# mateai-mods

Small Claude Code mods and skills from the [MateAI](https://www.youtube.com/@cryptomate9259) channel.

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

A skill, not a mod: it runs no code of its own. You run it in an Opus session. Opus researches and plans the task, then hands the implementation to Sonnet subagents and reviews what they wrote. **Experimental (v0.1.0).**

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

### Requirements

- Claude Code with the Agent tool (subagents). It does not work in plain chat.
- A session running an Opus-class model. On anything else it warns you and asks before continuing.
- Optional: the `karpathy-guidelines` and `code-review` skills. Without them it applies the same rules inline.

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

The skill is one file: [`plugins/delegate/skills/delegate/SKILL.md`](plugins/delegate/skills/delegate/SKILL.md). It is plain instructions for Claude, but it makes Claude spawn subagents that edit files and run commands **with your permissions**. Read it, and try it first on a branch or a throwaway repo.

### Layout

```
plugins/delegate/                    the plugin
  .claude-plugin/plugin.json
  skills/delegate/SKILL.md
```

## License

MIT. See [LICENSE](LICENSE).

# mateai-mods

Small Claude Code mods from the [MateAI](https://www.youtube.com/@cryptomate9259) channel.

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

## License

MIT. See [LICENSE](LICENSE).

# Agent Handoff — Writing Style

- Project: writing-style/
- Status: completed
- Last agent: Codex
- Updated: 2026-09-12
- Branch: Public Bookmarklet main
- Commit: functional public migration 386b194; see Git log for the final evidence commit
- Working tree: task paths committed; local-only data excluded

## Last completed work

Published the 44 tracked writing-style files plus root `AGENTS.md`/`CLAUDE.md` to Public `Gadget-Otaku/Bookmarklet/main`. Runtime 1.1.0 uses the stable Public raw URL and verifies STYLE metadata. Anonymous raw read-back matched local hashes and remote smoke passed 5/5. Saved the 2,008-character marker body to GPT `X投稿用`; Chrome access-only diagnostic returned the raw source link and expected account, style_version and generated_at values. No X post was generated. Raw corpus, holdout prose, model outputs/events, credentials and local manifests were excluded.

## Validation

Historical evaluation remains: 161 eligible final cases / 483 candidates, mechanical 160/161, mean 4.710. Current runtime 1.1.0 has 2,008 raw characters / 4,676 UTF-8 bytes / 22 lines. Unit tests: 19 PASS. Public remote SHA read-back: PASS. Anonymous raw STYLE/runtime hash match: PASS. Remote smoke: 5/5 PASS. GPTs raw-source diagnostic: PASS. STYLE 1.0.0 and the consumed final evaluation remain unchanged.

## Remaining work

No required work for the completed migration. The former Private project and its `.local` data remain preserved as migration history and local-only evidence.

## Important files

- x/STYLE.md
- x/GPTS_INSTRUCTIONS.md
- x/ANALYSIS.md
- x/EVAL_REPORT.md
- x/scripts/run_codex_eval.py
- docs/DECISIONS.md

## Blockers

No current blocker. The GPT normalized `platform: x` to display `platform: X`; the raw source link and the other metadata matched.

## Local-only state

The former local project retains `.local` corpus, splits, semantic annotations and evaluation logs. They were not copied into this Public checkout. Any new `.local` remote-smoke evidence remains ignored.

## Next recommended action

Use the Public Bookmarklet path as the canonical distribution source. For a future style version, use new independent data and do not reuse the consumed final set as fresh holdout.

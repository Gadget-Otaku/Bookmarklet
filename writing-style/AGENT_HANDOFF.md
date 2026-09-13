# Agent Handoff — Writing Style

- Project: writing-style/
- Status: in progress
- Last agent: Codex
- Updated: 2026-09-12
- Branch: Public Bookmarklet main
- Commit: pending first public migration commit
- Working tree: tracked migration prepared from the former Private project; local-only data excluded

## Last completed work

Prepared migration of the 44 tracked writing-style files to Public `Gadget-Otaku/Bookmarklet/main/writing-style/`. Runtime 1.1.0 uses the stable Public raw URL and verifies STYLE metadata. Raw corpus, holdout prose, model outputs/events, credentials and local manifests were excluded. Publication, anonymous raw read-back, GPT Instructions update and live retrieval verification are pending.

## Validation

Historical evaluation remains: 161 eligible final cases / 483 candidates, mechanical 160/161, mean 4.710. Current runtime 1.1.0 has 2,008 raw characters / 4,676 UTF-8 bytes / 22 lines. Unit tests: 19 PASS. Public remote and GPT retrieval checks are pending; STYLE 1.0.0 and the consumed final evaluation remain unchanged.

## Remaining work

Publish the prepared project, verify anonymous raw bytes and remote smoke, update the custom GPT Instructions in Chrome, then run an access-only diagnostic without generating an X post.

## Important files

- x/STYLE.md
- x/GPTS_INSTRUCTIONS.md
- x/ANALYSIS.md
- x/EVAL_REPORT.md
- x/scripts/run_codex_eval.py
- docs/DECISIONS.md

## Blockers

No current publication blocker. Do not mark GPT raw retrieval complete until the live response shows the expected STYLE metadata from the Public raw URL.

## Local-only state

The former local project retains `.local` corpus, splits, semantic annotations and evaluation logs. They were not copied into this Public checkout. Any new `.local` remote-smoke evidence remains ignored.

## Next recommended action

Complete the pending publication and GPT access-only checks. For a future style version, use new independent data and do not reuse the consumed final set as fresh holdout.

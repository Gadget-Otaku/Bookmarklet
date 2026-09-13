# Bookmarklet Repository Guide

## Scope and rules

- Repository root: this checkout of Public `Gadget-Otaku/Bookmarklet`.
- Apply `$CODEX_HOME/AGENTS.md`, `$CODEX_HOME/rules/INDEX.md`, `git-and-workspace.md`, `development-tooling.md`, and `agent-collaboration.md` when they are available.
- The repository contains independent bookmarklets, userscripts, static tools, extensions, data files, and the `writing-style/` project. Read a nearer `AGENTS.md` before changing a subproject.
- Preserve unrelated files and user changes. Do not reformat or reorganize the repository as part of a scoped task.

## Public repository boundary

- This repository is Public. Before every commit, inspect the exact staged paths for credentials, private URLs, raw personal data, logs, large generated files, and machine-specific paths.
- Public pushes require an explicit user request covering the content and destination. The writing-style migration was explicitly authorized on 2026-09-12.
- Never add cookies, tokens, private keys, `.env` files, local browser state, raw writing corpora, holdout prose, model logs, or agent runtime data.
- Use `git status --short`, `git diff --check`, targeted tests, and remote read-back. Do not use force push, history rewrite, or destructive cleanup.

## Writing-style project

- `writing-style/x/STYLE.md` is the public X style source used by the custom GPT.
- Its stable raw URL is `https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/writing-style/x/STYLE.md`.
- `writing-style/.gitignore` excludes the raw corpus, evaluation sessions, and local-only evidence under `.local/`.
- Follow `writing-style/AGENTS.md` for evaluation, version, privacy, and publication requirements.

## Validation

For writing-style-only changes, run from the repository root:

```sh
python3 writing-style/x/scripts/verify_project.py
python3 -m unittest discover -s writing-style/x/tests -v
git diff --check
```

After publication, verify the remote commit and anonymously fetch the raw URL. Treat repository publication, raw-file availability, GPT retrieval, and generated output as separate gates.

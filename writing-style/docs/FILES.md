# File inventory

すべてwriting-styleを基準とする。raw corpus、split、brief、model出力、events、詳細証拠は`x/.local/`へ隔離し、Git追跡外。

| Files | Role |
| --- | --- |
| [README.md](../README.md) | 全体構造、媒体追加、統合境界 |
| [AGENTS.md](../AGENTS.md)、[CLAUDE.md](../CLAUDE.md) | project規則と薄いadapter |
| [.gitignore](../.gitignore) | 原文・評価ログ・Python cacheの除外 |
| [AGENT_HANDOFF.md](../AGENT_HANDOFF.md)、[CHANGELOG.md](../CHANGELOG.md) | 現在のcheckpointと変更履歴 |
| [docs/DECISIONS.md](DECISIONS.md) | 独立Skill境界、隔離、分割、選定、公開の判断 |
| [x/STYLE.md](../x/STYLE.md) | X文体の唯一の正本 |
| [x/GPTS_INSTRUCTIONS.md](../x/GPTS_INSTRUCTIONS.md) | GPTs取得・入力分類・出力controller |
| [x/README.md](../x/README.md) | 実行command、統合・配備手順 |
| [x/ANALYSIS.md](../x/ANALYSIS.md) | 機能的な文体分析とtrain用例の根拠 |
| [x/QUANTITATIVE.md](../x/QUANTITATIVE.md) | 長さ、口癖、語尾、時期、mode別集計 |
| [x/CORPUS_MANIFEST.md](../x/CORPUS_MANIFEST.md) | 原本hash、件数、期間、parser監査、split |
| [x/TEST_CASES.md](../x/TEST_CASES.md) | 30 synthetic回帰caseの閲覧版 |
| [x/EVAL_REPORT.md](../x/EVAL_REPORT.md) | 3round、locked final、remote実測と限界 |
| [x/eval/README.md](../x/eval/README.md)、[rubric.md](../x/eval/rubric.md) | 評価契約と13軸rubric |
| [cases.jsonl](../x/eval/cases.jsonl) | 合成inputと検証条件 |
| [train_labels.jsonl](../x/eval/train_labels.jsonl)、[identity](../x/eval/train_labels.meta.json) | 原文なしの分類と対応hash |
| [corpus_baseline.json](../x/eval/corpus_baseline.json)、[results_summary.json](../x/eval/results_summary.json) | 比較・評価集計。原文・post IDを含まない |
| x/eval/schemas/generation.json、judge.json、neutralization.json | 構造化出力schema |
| x/eval/revisions/*.patch | Baseline→Revision 1→Revision 2とreleaseの再構成用差分 |
| [x/tests/test_pipeline.py](../x/tests/test_pipeline.py) | counter、parser、文脈漏洩、出力gate、schemaのunit test |

## Python scripts

| Script | Role |
| --- | --- |
| [parse_corpus.py](../x/scripts/parse_corpus.py) | 非破壊parse、構造監査、IDだけのsplit |
| [count_x_chars.py](../x/scripts/count_x_chars.py) | 指定された280 weighted units契約 |
| [analyze_corpus.py](../x/scripts/analyze_corpus.py) | train専用cleanupと集計 |
| [annotate_train.py](../x/scripts/annotate_train.py) | 独立CLIによるtrain全件の意味分類 |
| [write_analysis_tables.py](../x/scripts/write_analysis_tables.py) | manifest・数値表の再生成 |
| [codex_session.py](../x/scripts/codex_session.py) | macOS隔離・CLI起動・event検査 |
| [build_eval_prompt.py](../x/scripts/build_eval_prompt.py) | marker抽出とgeneratorへの入力限定 |
| [make_cases.py](../x/scripts/make_cases.py) | 合成caseのJSONL/閲覧版を生成 |
| [run_codex_eval.py](../x/scripts/run_codex_eval.py) | neutralize→generate→check→judge |
| [evaluate_outputs.py](../x/scripts/evaluate_outputs.py) | 出力の機械判定とscore集計 |
| [freeze_best.py](../x/scripts/freeze_best.py) | developmentから選定してhash固定 |
| [write_eval_report.py](../x/scripts/write_eval_report.py) | 集計reportと差分履歴の生成 |
| [remote_smoke.py](../x/scripts/remote_smoke.py) | gh read-backと取得copyによるsmoke |
| [verify_project.py](../x/scripts/verify_project.py) | 必須file、hash、privacy、link、test検証 |

## Repository root and external boundaries

- repository rootの`AGENTS.md`と`CLAUDE.md`: Public repositoryのprivacy gate、writing-style raw URL、検証入口。
- `$CODEX_HOME`側の汎用ruleと既存generic writing Skillは、このPublic repositoryへ複製しない。
- raw corpus、holdout、詳細model logは元のlocal-only `.local/`に保持し、移行対象外。

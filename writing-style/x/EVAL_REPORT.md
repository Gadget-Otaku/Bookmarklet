# X style evaluation — 1.0.0

評価日: 2026-09-11。採用はRevision 1。必須形式を満たす件数を最優先する事前のrubricで54/54となった版を選んだ。Baselineは主観平均と意味保持が上であり、Revision 1が全観点で優れるという結論ではない。

## Data and isolation

train 1,486件で文体を構築。development 176件中24件をIDのsalted SHA順で選び、synthetic 30件を加えた同じ54件を全3roundで評価。各候補を13軸0–5で採点し、候補→case→datasetの順で平均した。作者推定確率、人間らしさscore、AI検出結果ではない。

モデルはgpt-5.6-sol、reasoning high、Codex CLI 0.145.0。neutralizer、generator、judgeは新規ephemeral session。generatorにはSTYLE、marker内runtime、id/inputだけを渡し、reference、expected_mode、constraints、judge feedbackは渡していない。原文を渡すのはneutralizerとjudgeだけ。neutralizerは原文を中立briefへ変換し、長い日本語説明の一致を独立sessionで再中立化。固有名詞だけの一致は除外した。

主なflagsはexec --ephemeral --ignore-user-config --sandbox read-only --skip-git-repo-check --model gpt-5.6-sol --json --output-schema。project_doc_max_bytes=0、web_search=disabled、history.persistence=none、skills.include_instructions=falseに加えshell/apps/plugins/memory系を無効化。macOS Seatbeltはprocess全体にrepository、Downloads、attachments、個人instructions/skills/session/memoryへのread-denyを適用した。native executableを用い、authはコピーも変更もしていない。実設定は[runner](scripts/codex_session.py)。

完了した評価session=148、異なるthread ID=148、実tool event=0。global AGENTSの意図した読込み拒否を別扱いし、他のtool/errorは不採用。ラッパーtool名の残存と実アクセスの成功を混同しない。CLI preflightとcanaryのraw証拠は.localに保存。

## Iterations

| Round | Cases / candidates | Mechanical PASS | Mean / 5 | Intent | Fact |
| --- | --- | --- | --- | --- | --- |
| baseline | 54 / 162 | 53/54 | 4.8474 | 4.8586 | 4.8475 |
| revision1 | 54 / 162 | 54/54 | 4.809 | 4.7593 | 4.7383 |
| revision2 | 54 / 162 | 53/54 | 4.8273 | 4.8111 | 4.7969 |
| final | 161 / 483 | 160/161 | 4.71 | 4.6923 | 4.6644 |

Baselineで反復した確信度変更・類似候補を受け、Revision 1はSTYLEの観測/推測区分とruntimeの候補構造差を修正。形式条件は全件PASSとなったが、一語入力や第3候補に意味追加・省略が増えた。Revision 2では意味の核の照合と感情/推測の区分を強化したが、形式と主観平均の両方で採用基準を更新できなかった。各修正後は全54件を再実行した。

修正は[差分](eval/revisions/baseline-to-revision1.patch)、[Revision 2差分](eval/revisions/revision1-to-revision2.patch)で保存。git apply --unidiff-zero --reverseでreleaseとの差分を逆適用してRevision 1を再構成し、各差分を逆順に辿れる。3版とも再構成後のbytesが評価snapshotと一致することを検証した。これらは評価履歴でありruntimeの第二の正本ではない。

Baselineの初回機械判定49/54は、URL保持と短い語順変更を90%文字一致で誤検出した。同じ保存済み出力に対し、URLを除く完全一致又は両候補60文字以上で94%以上一致へ修正して53/54。生成やjudgeの再抽選はしていない。表は全round共通の修正後checker。微妙な同義語交換はjudgeで別評価する。

| Axis | baseline | revision1 | revision2 | final |
| --- | --- | --- | --- | --- |
| style_similarity | 4.6512 | 4.5994 | 4.6296 | 4.4466 |
| thought_flow | 4.8951 | 4.7642 | 4.7944 | 4.6961 |
| vocabulary | 4.7957 | 4.8185 | 4.7821 | 4.5857 |
| rhythm | 4.7099 | 4.6537 | 4.6648 | 4.6112 |
| mode | 4.9327 | 4.8667 | 4.8926 | 4.7646 |
| emotion | 4.8414 | 4.7759 | 4.779 | 4.4126 |
| sarcasm | 5.0 | 5.0 | 5.0 | 4.9733 |
| x_naturalness | 4.7691 | 4.7654 | 4.7716 | 4.7495 |
| ai_pattern_avoidance | 4.8938 | 4.9648 | 4.9778 | 4.9145 |
| conciseness | 4.842 | 4.8617 | 4.863 | 4.7491 |
| intent | 4.8586 | 4.7593 | 4.8111 | 4.6923 |
| fact_discipline | 4.8475 | 4.7383 | 4.7969 | 4.6644 |
| over_imitation_avoidance | 4.9796 | 4.9494 | 4.992 | 4.9702 |

元投稿からの再構成と未知topicの合成caseを分離した結果:

| Round | Source | n | Mechanical PASS | Mean | Intent | Fact |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | development_holdout | 24 | 23 | 4.7785 | 4.8486 | 4.8375 |
| baseline | synthetic | 30 | 30 | 4.9026 | 4.8667 | 4.8556 |
| revision1 | development_holdout | 24 | 24 | 4.7122 | 4.6722 | 4.6847 |
| revision1 | synthetic | 30 | 30 | 4.8865 | 4.8289 | 4.7811 |
| revision2 | development_holdout | 24 | 23 | 4.776 | 4.825 | 4.7931 |
| revision2 | synthetic | 30 | 30 | 4.8684 | 4.8 | 4.8 |
| final | final_holdout | 161 | 160 | 4.71 | 4.6923 | 4.6644 |

同一caseの全軸平均差を2,000回bootstrapした参考区間（Baseline差、case単位、固定seed）:

| Round | Mean difference | 95% case interval |
| --- | --- | --- |
| revision1 | -0.0384 | [-0.0955, 0.0085] |
| revision2 | -0.0201 | [-0.0566, 0.0198] |

この区間はLLM再実行の揺らぎを測っていない。独立した人間評価、複数model judge、複数seed比較をしておらず、わずかな点差を確定的な品質差と解釈しない。

中立化で原文の感情・曖昧さ・含みが変わる可能性がある。一致0は表現の漏洩検査であり、意味保存の完全性を証明しない。finalの指摘はこの入力変換を含むpipeline全体の結果であり、全てをSTYLE単体の誤差とは断定しない。

## Locked final

固定日時 2026-09-11T21:44:26.611094+00:00。最良選択はmechanical PASS件数→intent/fact平均→全軸平均。STYLE/runtimeを1.0.0へ正規化しhash固定した後、final全162件を一度だけ開いた。文体調整には使用していない。中立化後に十分な作者内容がある161件を評価し、内容不足1件は別扱い。最終スコアを見て生成を選び直していない。

中立化後の長い日本語説明一致=0件。原文はlocal-only。画像や返信先を補わない。同じ短い定型反応のtext hashがtrainと共有するtypesはdev=1、final=2あり、ID分割はtopic/threadの独立を保証しない。

## Mechanical failures and judge patterns

| Round | Mechanical failures | Judge failure clusters |
| --- | --- | --- |
| baseline | {"obvious_duplicate": 1} | {"certainty_shift": 12, "awkward_rhythm": 13, "lost_emotion": 2, "invented_facts": 6, "three_outputs_too_similar": 5, "intent_loss": 5, "too_ai_like": 1} |
| revision1 | {} | {"certainty_shift": 13, "intent_loss": 8, "awkward_rhythm": 10, "invented_facts": 8, "wrong_mode": 1, "too_ai_like": 1, "lost_emotion": 1, "three_outputs_too_similar": 3} |
| revision2 | {"obvious_duplicate": 1} | {"lost_emotion": 5, "awkward_rhythm": 17, "certainty_shift": 16, "intent_loss": 5, "three_outputs_too_similar": 2, "too_verbose": 2, "too_ai_like": 1, "invented_facts": 3, "over_correction": 2} |
| final | {"over280": 1} | {"certainty_shift": 45, "lost_emotion": 27, "intent_loss": 29, "three_outputs_too_similar": 10, "awkward_rhythm": 24, "invented_facts": 22, "too_ai_like": 2, "fake_sarcasm": 1, "too_verbose": 3, "over_correction": 1, "short_reaction_too_verbose": 1, "too_aggressive": 2, "insufficient_sarcasm": 1, "wrong_mode": 1} |

| Round | Candidate max units | Candidates over 280 | Failed case IDs |
| --- | --- | --- | --- |
| baseline | 255 | 0 | D009 |
| revision1 | 261 | 0 | none |
| revision2 | 253 | 0 | D009 |
| final | 282 | 1 | F069 |

機械FAILはLLM高得点で相殺しない。judgeのclusterはcase単位で重複除去した指摘数であり、正解付き分類の精度ではない。文体の一致だけでなく、確認済み事実を条件文へ変える、願望を予測にする、主観を強める、入力外の因果や本人経験を補う失敗を監視する。一語/文脈欠損では意味を保った3案の差を十分に作れない場合が残る。

counterの正しさと、計算toolを使えないLLMだけで常に280以内へ収める能力は別。evalは出力を黙って修正せずFAILを残す。production clientは必要に応じて同じcounterで送信前に検証し、超過候補をユーザーへ渡す前に扱いを決める必要がある。そのclient実装は今回行っていない。

## Corpus distribution comparison

以下は対応holdout原文と生成候補の比較。原文は自然文cleanup後、生成は全3候補。自然文抽出0のreferenceは、この分布比較のみ両側から除外し、評価scoreからは除外しない。syntheticを除いて話題の差を抑えるが、neutralizationによる内容圧縮や1原文対3候補の違いは残る。全trainとの一致率を採点目標にしていない。

| Set | N | Weighted mean | Sentence mean | Newline rate | Question rate | まあ / てか / マジ / めっちゃ |
| --- | --- | --- | --- | --- | --- | --- |
| train natural | 1444 | 140.704 | 2.427 | 0.19529 | 0.14058 | 156/86/107/54 |
| baseline reference | 23 | 135.304 | 2.261 | 0.21739 | 0.13043 | 1/2/1/1 |
| baseline generated | 69 | 122.232 | 2.174 | 0.0 | 0.14493 | 0/0/5/0 |
| revision1 reference | 23 | 135.304 | 2.261 | 0.21739 | 0.13043 | 1/2/1/1 |
| revision1 generated | 69 | 115.594 | 2.014 | 0.0 | 0.15942 | 1/1/7/0 |
| revision2 reference | 23 | 135.304 | 2.261 | 0.21739 | 0.13043 | 1/2/1/1 |
| revision2 generated | 69 | 116.884 | 2.13 | 0.0 | 0.13043 | 1/0/5/0 |
| final reference | 161 | 131.919 | 2.391 | 0.24845 | 0.13665 | 13/14/14/5 |
| final generated | 483 | 121.487 | 2.128 | 0.00414 | 0.0911 | 2/11/19/6 |

完全な語尾、記号、口癖、句数、長さ分布は[集計JSON](eval/results_summary.json)のmatched_distributionに収録。生成は口癖・改行を抑える傾向があり、本人の自己修正の間や長短の幅を弱める可能性がある。一律quotaで口癖を増やすのではなく、次versionでは同じmode/話題で機能に対応した分布を検査する。

## Runtime, tests and reproducibility

採用style_version=1.0.0、runtime_version=1.0.0。marker間本文: 1509 raw chars、3675 UTF-8 bytes、20 lines。公式GPTs資料で現在のInstructions上限の明記を確認できず、使用率と余裕はUNKNOWN。通常ChatGPTのCustom Instructions上限を代用していない。[公式資料](https://help.openai.com/en/articles/8554397-creating-a-gpt)（2026-09-11確認）。

現在のGPTs controllerはruntime_version=1.1.0。marker間本文は2008 raw chars、4676 UTF-8 bytes、22 lines。Public GitHubの固定raw URL、HTTP本文metadata検査、会話内再利用、Knowledge fallbackを明記した取得制御。STYLE 1.0.0は不変で、消費済みfinalを再利用してこのruntime更新の主観scoreを作らない。

19 unit tests: PASS。ASCII、日本語、改行、複合emoji、URL、混在、279/280/281、parser欠損/重複、本文なしexport marker、安定split、promptからanswer key排除、runtime marker、GitHub取得契約、出力形式、protected URL、重複、schema、保存済み出力hashを検査。固定train labelsで統計を再計算し、元の数値集計とbyte一致。label hashとtrain JSONL hashも照合する。X公式twitter-text完全互換は主張しない。

必須file/metadata/link/raw除外、評価済みfrozen hash、現在runtimeのGitHub取得契約はverify_project.pyで検査。raw corpus、holdout、prompts、model出力とeventsは.localのみ。tracked集計は原文・post ID・session IDを含まない。release/round hashesとcase-set hashは集計JSONに保存。

## Live GPTs deployment check

2026-09-12にGPT `X投稿用` のInstructionsへruntime 1.0.3を保存し、Chromeで再読込した値がmarker間本文とbyte一致することを確認。Floorpでは競合が生じたため、その後の配備確認はChromeの新規タブだけで行った。

同じ入力「最新版を再読込して、次のメモを短いX投稿にしてください」で、Pro指定ありは1候補だけを返してFAIL。Pro指定を外した別の新規会話は①②③を各1回含む3候補を返してPASS。model表示のない既定経路とPro経路を同一結果として扱わない。

Private `Gadget-Otaku/dev`は通常Web取得で404となったため、ユーザーの明示指示で公開可能なtracked projectだけをPublic `Gadget-Otaku/Bookmarklet`へ移行。raw corpus、holdout原文、model output/event、credential、local manifestは移行していない。Public raw URLの取得と3候補形式はGPTsの新規会話で別々に確認する。

## Publication and remote smoke

Public `Gadget-Otaku/Bookmarklet/main/writing-style/`への移行を準備。最初のpush後に匿名raw URLを読み戻し、local hash照合と5-case smokeを行う。この段階ではPENDING。

| File | Remote/local SHA-256 |
| --- | --- |
| STYLE.md | pending public read-back |
| GPTS_INSTRUCTIONS.md | pending public read-back |

評価後のreportだけを追記する場合も、STYLE/runtime hashは不変。最後の文書commitはGit履歴と完了時read-backで確認する。

公開treeのsecret/large-file/nested-Git等のauditは3,624 files / 0 findings。現行workspaceに基づく隔離review treeも5,064 files / 0 findings。共有workspaceそのもののauditに残る別案件の未追跡Android source 2件を、今回のstageへ取り込んで解消した扱いにはしていない。project adapter/Handoff、必須file/link/privacy/hash、18 unit testsはPASS。READMEのcherry-pick競合はwriting-styleの案内だけを既定branchへ加える形で解決した。

一般化したCLI隔離規則は正本からallowlist mirrorを生成し、28 files / drift 0とrule validationを確認。既存設定管理branch `agents/interop-baseline` のcommit `0cbd298356cb6911ee2c5e61d4c492fb4402270d` へ反映し、Private visibilityと変更3fileのremote SHA-256一致をread-backした。default branchに未統合の他案件履歴を混ぜないため、文体projectの公開と分離している。

## Notion and remaining limits

既存の開発Wishlist更新では原文やprivate corpusを外部serviceへ送信していない。Public repositoryへの移行でもraw corpus、holdout、model logsはlocal-onlyを維持する。

Public raw URLのGPTs実取得は初回公開後に確認する。KnowledgeへのSTYLE upload、Iceravenへの組込み、実際のX投稿・UI counter、live fact-check経路、人間の第三者評価: NOT TESTED。CLIのSTYLE+runtime模擬、公開raw read-back、GPTsの実取得を同じ成功証拠として扱わない。

次versionの優先課題は、意味の省略/確信度の変化、短い曖昧入力の3案、本人の自己修正・改行・口癖の機能、丁寧な不同意と技術以外のhumor。finalは使用済みであり、追加の独立コーパスと人間によるblind評価で確認する。今回finalの失敗を見てSTYLEを再調整しない。

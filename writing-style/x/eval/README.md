# X evaluation protocol

- [cases.jsonl](cases.jsonl): 30 synthetic cases。元投稿のcopyは含まない。
- [rubric.md](rubric.md): 13軸、候補単位の0–5評価。
- [schemas](schemas/generation.json): generation/judge/neutralizationのJSON schema。
- [train_labels.jsonl](train_labels.jsonl): 原文なしのtrain index/category/modes。
- [train_labels.meta.json](train_labels.meta.json): source/train/labelの対応hash。
- [corpus_baseline.json](corpus_baseline.json): 自然文trainの集計値のみ。

developmentは176件中24件をIDのsalted SHA順で選択し、同じ24件とsynthetic30件を全roundで使用。finalは未使用162件を最良version固定後に全件neutralizeし、十分な本文がないケースは件数と理由を別記する。画像や返信先を補わない。

neutralizerは原文を中立なtopic/facts/stance/emotion/intent/contextへ変換。日本語説明の長い一致は別sessionで再中立化し、残る場合は停止。製品名だけの一致は語調の漏洩と区別。generatorにはruntime、STYLE、id/inputだけ。judgeだけが原文、expected traits、rubric、候補を受け取る。

生成→機械検査→別session judge。機械検査は3案、番号、空文、280上限、URL維持/新設、meta text、明白重複。duplicateは同じURLを除き正規化完全一致、または60文字以上の両候補で94%以上一致。短文の語順変更はLLMの構造差評価へ委ねる。文字一致を本人らしさscoreに使わない。

全候補個別の13軸scoreをcase平均→dataset平均へ集計。failure clusterは自由記述から定義済みlabelを抽出。機械検査はLLM judgeの高得点で上書きしない。raw events、原文、候補、promptは.localだけに保存。

`scripts/write_eval_report.py`は4roundの保存結果から集計report、原文を含まない`results_summary.json`、採用前後のrule差分を生成する。`--remote`には`remote_smoke.py`が実測したverification.jsonを指定する。差分は評価履歴であり、STYLEの第二の正本としてruntimeへ渡さない。

最良versionは機械PASS件数、intent/fact平均、全軸平均の優先順。finalを見る前にhash固定。最新が悪化したら前versionを採用する。評価は確率的で単一run、同じmodel familyのjudgeには自己選好・天井効果があり得る。人間による第三者評価、GPTs実runtime、live fact-checkの成功は別途確認が必要。

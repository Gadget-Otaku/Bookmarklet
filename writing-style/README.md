# Writing Style Profiles

本人固有の媒体別文体を、一つの正本から複数runtimeへ渡すためのproject。最初の実装はX / @niwakasumaho。一般的な良文の規則や、既存の英語向けwriting Skillとは独立する。

公開正本はPublic [`Gadget-Otaku/Bookmarklet`](https://github.com/Gadget-Otaku/Bookmarklet/tree/main/writing-style)の`writing-style/`。GPTsが直接取得するX文体のraw URLは[`writing-style/x/STYLE.md`](https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/writing-style/x/STYLE.md)。

## Structure and source of truth

- [AGENTS.md](AGENTS.md): projectの運用・privacy・評価境界。
- [x/STYLE.md](x/STYLE.md): vendor-neutralなX文体正本。
- [x/GPTS_INSTRUCTIONS.md](x/GPTS_INSTRUCTIONS.md): GPTsの取得・分類・出力controller。
- [x/ANALYSIS.md](x/ANALYSIS.md)、[数値表](x/QUANTITATIVE.md)、[manifest](x/CORPUS_MANIFEST.md): 根拠・集計・source identity。
- [x/TEST_CASES.md](x/TEST_CASES.md)、[評価基盤](x/eval/README.md)、[評価結果](x/EVAL_REPORT.md): 回帰と限界。
- x/.local/: 原本copy、split、neutral briefs、CLI logs。Git追跡外。
- [docs/DECISIONS.md](docs/DECISIONS.md): 境界設計と判断。
- [docs/FILES.md](docs/FILES.md): 作成・変更file一覧。

canonical pathはrepository-relativeの`writing-style/...`。scriptは自分の所在からprojectを解決し、個人名入り絶対pathを保存しない。raw corpusの実pathはignored manifestだけに保存する。

## Platform追加

新媒体はwriting-style/<platform>/へ追加し、本文由来のSTYLE、媒体runtime、根拠、privacy、評価を揃える。将来gmail、line、notionへ拡張可能だが、現在それらの文体profileは存在しない。Xの常体・罵語・短文ルールを他媒体へ流用しない。

## Privacy and versions

raw corpusは公開X投稿でもlocal-only。private messages、認証、Codex sessions、judge原文、model output全量をcommitしない。tracked train labelsにはindex/category/modeのみを残す。source hashと集計値、sanitized testsから再現性を確保する。

STYLEのstyle_versionとruntime_versionを別管理。majorはモデル構造、minorはmode追加、patchは較正。初期比較はbaseline/rc1/rc2、最良採用時に1.0.0。Gitは変更履歴、任意tagはwriting-style/x/v<version>。raw corpus更新時は新しいhashで分割・label・holdoutを再設計し、使い終わったfinalを新たな未使用holdoutと偽らない。

## Evaluation and integration

Python 3.10+標準library、Codex CLI、GitHub CLIを使用。commandは[X README](x/README.md)。trainとholdoutを分離し、neutralizer、generator、judgeを別sessionで実行。CLIはGPTs runtimeそのものではなくproxy regression test。第三者による作者らしさの判定は別の人間評価になる。

GPTsはPublic GitHubの固定raw URLからSTYLEを参照し、取得失敗時だけKnowledge snapshotまたは最小fallbackを使う。GitHub更新だけで既存会話のcacheやKnowledgeが同期されるとは仮定しない。Codex/Iceraven等はplatform=xを`writing-style/x/STYLE.md`へroutingし、runtime指示と現在入力を別々に渡す。将来platform=gmail等のprofileが存在しない時はXへ黙ってfallbackしない。

Iceraven本体と他clientの実装変更・配備は今回の対象外。GPTsのInstructionsとPublic raw取得はChromeで別々に検証する。

# X profile operations

文体正本は[STYLE.md](STYLE.md)。runtimeは[GPTs controller](GPTS_INSTRUCTIONS.md)、主分析は[ANALYSIS.md](ANALYSIS.md)、数値は[QUANTITATIVE.md](QUANTITATIVE.md)、source identityは[CORPUS_MANIFEST.md](CORPUS_MANIFEST.md)。評価の仕様と結果は[eval](eval/README.md)、[EVAL_REPORT.md](EVAL_REPORT.md)。

## Setup and analysis

repository rootから実行。Python 3.10+、外部Python依存なし。raw corpusをx/.local/corpus/source.txtへコピーし、元ファイルを残す。実pathはlocal source-location.jsonへ記録。既存splitの内容が変わる場合parserは停止し、上書きしない。

    python3 writing-style/x/scripts/parse_corpus.py writing-style/x/.local/corpus/source.txt --out writing-style/x/.local/corpus
    python3 writing-style/x/scripts/analyze_corpus.py writing-style/x/.local/corpus/train.jsonl --annotations writing-style/x/eval/train_labels.jsonl --out writing-style/x/.local/analysis
    python3 writing-style/x/scripts/write_analysis_tables.py
    python3 writing-style/x/scripts/verify_project.py

このlabelsはmanifestのsource SHAに対応する。新corpusでは使い回さず、次の意味分類を再実行し、分類の妥当性をreviewして新labelsを作る。

    python3 writing-style/x/scripts/annotate_train.py writing-style/x/.local/corpus/train.jsonl --out writing-style/x/.local/semantic

12batch全trainを読む処理。LLM分類の再生成は確率的。既存runはprompt hash一致の場合にだけ再開し、別promptで上書きしない。

## Evaluation

実測CLIは0.145.0、modelはgpt-5.6-sol、reasoning high。利用可能性はcodex debug modelsで確認。installed helpを優先し、model/flagsを変えた場合はbaselineから比較し直す。

    python3 writing-style/x/scripts/run_codex_eval.py neutralize --split development --count 24 --out writing-style/x/.local/eval-runs/development
    python3 writing-style/x/scripts/run_codex_eval.py evaluate --cases writing-style/x/.local/eval-runs/development/neutralized.jsonl --synthetic --round baseline --out writing-style/x/.local/eval-runs/baseline

revision1/revision2も同じcases、modelで別outへ実行。STYLEとruntimeのsnapshot/hashは各roundへlocal保存。生成には原文・judge・expected traitsを渡さない。変更の種別でSTYLEとruntimeの修正先を分ける。

最良選択は[freeze_best.py](scripts/freeze_best.py)で実行後、finalを一度だけ開く。再開は同一hashの保存済み出力を再利用するだけ。finalを見る前のschema/型修復以外の再生成でscoreを選び直さない。

    python3 writing-style/x/scripts/freeze_best.py
    python3 writing-style/x/scripts/run_codex_eval.py neutralize --split final --out writing-style/x/.local/eval-runs/final-neutral
    python3 writing-style/x/scripts/run_codex_eval.py evaluate --cases writing-style/x/.local/eval-runs/final-neutral/neutralized.jsonl --round final --out writing-style/x/.local/eval-runs/final

## Isolation

macOSでnative Codex executableを一時workspaceから起動。ephemeral、ignore-user-config、read-only、shell/apps/plugins/memory系無効化に加え、process全体へSeatbeltのread-denyを適用する。repository、Downloads、attachments、個人AGENTS、skills、sessions、memoryの読み取りを拒否。authは元の仕組みを使用し移植しない。親アプリのsession識別環境変数を継承しない。保護対象のglobal AGENTS読込拒否は期待されたイベントとして区別し、他のtool/errorイベントは失敗。

CLI側のread-onlyやproject_doc_max_bytes=0だけでは個人global AGENTS・全filesystemの読み取り制限を保証しなかった。非macOSではこのharnessをfail closedとし、同等の隔離を検証してからportする。UIラッパーtoolが表示されても使用しない。許可していないtool eventが出たrunは採用しない。

## Counter contract

ユーザー指定: 半角英数/記号=1、改行=1、全角=2、emoji cluster=2、HTTP(S) URL=23、上限280。NFC、CRLF→LF、ZWJ、skin tone、regional flag、keycap、emoji tagを扱う。その他の非ASCIIは保守的に2、半角カナは1。

bare domainはURL認識しない。URLの前後は空白か改行で区切る。URLに日本語を連結すると末尾の本文との区別が曖昧になるため避ける。IDN/日本語path、balanced parentheses、末尾句読点をtestする。Unicode全grapheme規則とX公式仕様の完全互換ではない。公式counterを導入する場合もユーザー契約との違いをtestする。

## GPTs / Codex / Iceraven

GPTsではmarker間だけInstructionsへ貼る。最優先の文体取得先はPublic `Gadget-Otaku/Bookmarklet`の`main`にある`writing-style/x/STYLE.md`。固定raw URLは`https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/writing-style/x/STYLE.md`。Web取得toolでraw本文とmetadataを確認し、取得できなければKnowledge snapshotへfallbackする。Knowledge更新時はstyle_versionとSHA-256を記録し、新規会話で短文/丁寧/噂/URLとraw取得成功/失敗を確認する。

Codexや将来のIceravenは、platform=xのrouting先をこのSTYLEにし、runtime、STYLE全文、現在inputを明示して渡す。運用メモ・過去judge feedback・raw corpusをgeneratorへ渡さない。Iceraven本体は未検証。GPTs UIのPublic raw取得と3候補形式はChromeの新規会話で別々に確認する。

## GitHub read-back

[remote_smoke.py](scripts/remote_smoke.py)はghでPublic repository/default branch/commitを確認し、認証Cookieなしのraw URLからlocal-only directoryへ取得する。local hashと比較し、取得copyを明示してCodex smokeを実行する。404や空fileを成功扱いにせず、取得中にdefault branchが変わっていないことも確認する。

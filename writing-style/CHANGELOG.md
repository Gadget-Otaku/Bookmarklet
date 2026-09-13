# Changelog

## 1.1.0 — 2026-09-12

- 公開正本をPublic `Gadget-Otaku/Bookmarklet/main/writing-style/`へ移行。
- GPTs controllerの取得先を固定raw URLへ変更し、HTTP本文のSTYLE metadata確認を追加。
- Private repo用の認証済みConnector/API前提を削除し、raw取得失敗時だけKnowledge/fallbackへ移る構成へ変更。
- remote smokeをPublic repository gateと匿名raw取得の検査へ変更。
- raw corpus、holdout、モデル出力、session dataは`.local/`のまま移行対象外。

## 1.0.3 — 2026-09-12

- 同じ実GPTで1.0.2も1候補だけを返すFAILを確認。
- 「短い投稿」「投稿にして」という単数形は1候補指定ではないと明記。
- 送信直前に①②③を自己検査し、欠けた回答を破棄して3候補を作り直す条件を追加。
- Chromeの新規会話で、Pro指定ありは1候補のままFAIL、Pro指定なしは同じ入力で①②③の3候補を返してPASS。
- エディタにGitHub ActionとSTYLE Knowledgeがなく、アクセス診断では通常Web経由のPrivate repoが404、認証済みGitHub Connector/APIは未提供と確認。GPT内のPrivate GitHub取得をBLOCKEDとして分離。

## 1.0.2 — 2026-09-12

- Floorp上の実GPTで、1.0.1が短文生成時に3候補ではなく1候補だけを返すFAILを確認。
- 3候補の最終出力契約をInstructions前半へ移し、①②③を各1回、1候補終了禁止、取得説明での代用禁止を明記。
- 同じ実GPTで再生成し、出力形式を読み戻して確認する更新。

## 1.0.1 — 2026-09-12

- GPTs controllerへPrivate GitHubのrepo、branch、STYLE path、参照URL、contents API相当の取得先を明記。
- 会話内cache、明示更新時の再取得、成功responseの確認、Knowledge/fallbackの順序を定義。
- InstructionsだけではGitHub権限を作れない境界と、取得成功・失敗のPreview項目を追加。
- STYLE 1.0.0とlocked final評価は変更せず、runtime取得制御だけをpatch更新。

## 1.0.0 — 2026-09-11

- X / @niwakasumaho向けの独立した文体正本とGPTs controllerを新設。
- 元TXTの1,824件をparseし、train/development/finalをID hashで固定。
- train全件の意味分類、Python集計、Core/Current/Modeの3層を実装。
- 30 synthetic cases、24 development reconstruction、独立neutralizer/generator/judge、機械検査を追加。
- Baselineから2 revisionsを比較。形式条件優先でRevision 1を採用。locked finalは161件/483候補、平均4.710、機械160/161（1候補282 units）。Private remoteのread-back/smokeもEVAL_REPORTに記録。
- counter、parser、prompt漏洩境界、番号/URL/重複検査をunit test。raw corpusとlogsはlocal-only。
- Private mainへ公開し、ghで取得した同一hashのSTYLE/runtimeによるsmoke 5/5 PASSを確認。

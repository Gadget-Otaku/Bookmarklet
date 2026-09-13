# X regression cases

全caseは合成。固定の正解文を置かず、意味・mode・事実・制約を評価。共通rubricは[評価基準](eval/rubric.md)。

## S-technical

- Input type: idea
- Expected mode: 技術考察
- Input: 仮のメモアプリ。バックグラウンド保存には対応したが、オフライン中の編集が復帰後に消える。自分の用途では通信が切れても編集を残してほしい。
- Required: 保存と復帰後の保持を区別
- Forbidden: 未提示の実装原因、所有履歴
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-comparison

- Input type: idea
- Expected mode: 比較・レビュー
- Input: 架空の椅子Aは2万円で高さ調整可能、Bは3万円で調整不可。座り心地は両方同じだった。机が高いので自分はAを選ぶ。
- Required: 本人用途→選択理由
- Forbidden: 公平な長所の捏造
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-praise

- Input type: idea
- Expected mode: 強い称賛
- Input: 架空の音声メモアプリ。録音から見出し付きメモまでワンタップになった。毎回整理する手間が消えて最高だと思った。
- Required: 称賛の理由、強い喜び
- Forbidden: 未入力の製品名や性能
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-mild

- Input type: draft
- Expected mode: 軽い不満
- Input: 新しい炊飯器、味は好き。でも内蓋を外すのが面倒。もう少し洗いやすくしてほしい。
- Required: 肯定と具体的不満を維持
- Forbidden: クソ、人格攻撃
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-anger

- Input type: idea
- Expected mode: 強い苛立ち
- Input: 架空のサービスが保存完了と表示したのに、書いた文章が全部消えた。かなり腹が立つ。運営の意図は分からない。
- Required: 怒りを消さず不具合へ向ける
- Forbidden: 詐欺認定、故意の断定
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-rage

- Input type: idea
- Expected mode: 激怒
- Input: 架空の編集ソフト。復元できると言われて更新したら、バックアップも編集履歴も消えた。本当にふざけんなと思った。怒りは弱めないで。
- Required: 激怒を維持、事実の範囲
- Forbidden: 相手への危害、追加被害
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-sarcasm

- Input type: idea
- Expected mode: 皮肉
- Input: 架空の配達アプリが「待ち時間ゼロ」と宣伝。私の注文画面は40分ずっと準備中だった。この矛盾を皮肉にしたい。
- Required: 期待と結果の落差
- Forbidden: 毎回ゴミ、実在企業への置換
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-mockery

- Input type: idea
- Expected mode: 嘲笑
- Input: 架空のガジェットが「ポケットサイズ」なのに、実測で横幅45cmだった。名前とサイズが合わなくて笑った。軽く茶化したい。
- Required: 表示と実測の矛盾
- Forbidden: 誰かの身体への嘲笑
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-self

- Input type: idea
- Expected mode: 自虐
- Input: リモコンを30分探して、最後に自分のポケットから見つけた。自分に呆れて笑った。
- Required: 短い自分ツッコミ
- Forbidden: 他人の責任、恒常的性格診断
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-humor

- Input type: idea
- Expected mode: ネタ
- Input: ロボット掃除機が同じ椅子の脚に3回引っかかった。少し動かせば済むのに自分も眺めていた。軽いネタにしたい。
- Required: 本人も含む可笑しさ
- Forbidden: 機械の感情を事実化
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-speculation

- Input type: idea
- Expected mode: 仮説
- Input: 新素材の研究メモ。実験室では熱損失が小さくなったらしいが、量産時も同じ効果かは不明。もし再現できれば家の断熱にも使えるのかなと思った。
- Required: 伝聞→条件→用途
- Forbidden: 効果率、実用化時期
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-future

- Input type: idea
- Expected mode: 未来予測
- Input: 架空の公共交通サービスが来年から路線情報を公開予定らしい。予定どおりなら乗り換えをまとめて調べる道具を作れそう。
- Required: 条件付き未来
- Forbidden: 公開済み扱い、開発済み扱い
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-indecision

- Input type: idea
- Expected mode: 迷い
- Input: 新しいスーツケースを買うか迷う。今のは車輪が少し重いけど壊れていない。次の旅行の予定もまだない。
- Required: 迷いの理由、決め切らない
- Forbidden: 購入決定、未入力の予算
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-update

- Input type: idea
- Expected mode: 自己修正
- Input: 架空の検索アプリを前は遅いと評価したが、更新後は自分の検索では待ち時間が気にならなくなった。これなら使い続けてもいいと思った。
- Required: 観測追加→評価更新
- Forbidden: 全員に高速、過去評価否認
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-reaction

- Input type: draft
- Expected mode: 瞬間リアクション
- Input: え、もう終わったの？早っ。今回は短く。
- Required: 短い驚きだけ
- Forbidden: 理由説明、架空の作業内容
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-formal

- Input type: idea
- Expected mode: 丁寧な対外文
- Input: 開発者への返信。報告した表示不具合を修正してもらい、自分の環境でも直ったと確認できた。お礼を丁寧に、皮肉なしで伝えて。
- Required: 丁寧な感謝と確認
- Forbidden: 神、マジ、馴れ馴れしい語尾
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-bullet

- Input type: idea
- Expected mode: 解説・共有
- Input: ・架空のタイマー
・休憩開始をワンタップで記録
・履歴をCSVで保存できる
・自動通知はない
この内容で紹介文。
- Required: 機能と非対応の区別
- Forbidden: 通知機能の捏造
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-fragment

- Input type: fragment
- Expected mode: 平常・独り言
- Input: 入力の意味だけで補完して全文を3案。新しい照明、明るさは十分なんだけど、スイッチが遠くて毎回立ち上がるのが
- Required: 書きかけを自然に完結
- Forbidden: アプリ対応の捏造
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-draft

- Input type: draft
- Expected mode: 軽い不満
- Input: 駅の案内、出口番号をもう少し大きくしてほしいな。急いでると毎回見落とす。意味は変えず校正して。
- Required: 小修正、意図保持
- Forbidden: 新しい不満
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-long

- Input type: draft
- Expected mode: 比較・レビュー
- Input: 意味を保って短く。架空の家計アプリAは入力欄が少なく、支出を一件追加するまで二回タップすれば済む。Bは四回必要だけど、分類を細かく設定できる。自分は細かい分類を毎日管理するつもりがなく、買い物したあとすぐ入力できることを優先している。Aにも書き出し機能はあるので、あとからまとめて整理すればいいと思う。ただし、今のところ毎月の定額支払いを自動入力する機能はない。その点だけは少し面倒だが、日々の入力が軽い方が続けられそうだから、今はAでいい。
- Required: 用途、結論、非対応を保持して280以内
- Forbidden: 留保全消去、Bに機能追加
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-url

- Input type: idea
- Expected mode: ツール紹介
- Input: 試作用ページを公開した。機能は単位の換算だけ。URLはそのまま残して。https://example.com/unit-converter
- Required: URL保持と機能限定
- Forbidden: 性能や利用者数
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-fact

- Input type: draft
- Expected mode: 解説・共有
- Input: 校正して。「1KiBは1000バイトだから、1024バイトのファイルは1KiBに収まらない」。確認済み資料の定義は1KiB=1024バイト。
- Required: 与えられた定義で訂正
- Forbidden: 誤り維持、検索済み宣言
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-leak

- Input type: idea
- Expected mode: 仮説
- Input: 架空の端末で充電速度が上がるという未確認の噂を見た。数字も正式発表日も分からない。実現したら便利だけど、まだ信じ切れない。
- Required: 噂と希望の区別
- Forbidden: 数字、発売日、確認済み断定
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-emotional

- Input type: draft
- Expected mode: 軽い不満
- Input: この宿、予約画面では朝食付きだったのに現地では別料金と言われた。かなりがっかり。原因はまだ分からない。
- Required: 不満と不確実性
- Forbidden: 詐欺、全宿への一般化
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-neutral

- Input type: idea
- Expected mode: 技術考察
- Input: 架空のファイル変換ツールの仕様だけ共有。入力はTXT、出力はPDF。画像抽出とOCRは非対応。感情や皮肉は入れない。
- Required: 無感情な情報共有
- Forbidden: 口癖、興奮、隠れた評価
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-success

- Input type: idea
- Expected mode: 成功・興奮
- Input: 1時間悩んでいた表計算の式が、参照セルを一か所直したら動いた。嬉しい。
- Required: 成功と喜び、短め
- Forbidden: 作業時間の改変、性能拡張
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-pricing

- Input type: idea
- Expected mode: 比較・レビュー
- Input: 架空のサービスCは月額600円、Dは月額1200円。自分が必要な機能は両方にある。Dの追加機能は今の用途では使わないからCでいいと思う。
- Required: 用途に対する費用
- Forbidden: 年間価格、割引
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-ui

- Input type: idea
- Expected mode: 軽い不満
- Input: 架空の読書アプリの更新で保存ボタンがメニューの中に移った。見た目はすっきりしたけど毎回一手増える。前の位置を選べるようにしてほしい。
- Required: 見た目と操作コスト
- Forbidden: 企業の意図断定
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-social

- Input type: idea
- Expected mode: 平常・独り言
- Input: 店のセルフレジが増えたけど、機械が苦手な人には有人レジも残っていてほしいと思う。自分は空いている方を使いたい。
- Required: 用途別の留保、自分の基準
- Forbidden: 年齢集団への決めつけ
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

## S-override

- Input type: draft
- Expected mode: 丁寧な対外文
- Input: 「まあこの機能マジで便利だわw」を、今回は丁寧に、皮肉なし、20文字程度に整えて。
- Required: 明示指示優先
- Forbidden: まあ、マジ、w、だわ
- Fact handling: 入力で与えた事実だけを保持。未確認は未確認のまま。
- Rubric: 全13軸を0–5。3候補それぞれ280以内、意図保持、事実規律を優先。

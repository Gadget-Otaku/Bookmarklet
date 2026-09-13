# Design decisions

## 独立した正本

X固有の文体はwriting-style/x/STYLE.md、runtimeの読込・分類・形式はGPTS_INSTRUCTIONS.md。既存writing Skillの正本はCODEX_HOME/.agents/skills/writing/SKILL.md、探索用skills/writingは相対symlinkで、現行entrypointは英語文章向け。今回は変更しない。

ユーザー指定を優先し、新projectをmonorepo直下のwriting-styleへ配置。nested Gitなし。媒体追加はdirectory単位で、未分析のGmail/LINE/Notion用ルールは作らない。

## Leakage boundary

post IDのSHA-256 mod 10で分割し、train本文を読む前に固定。format調査時に先頭数投稿の短いprefixを見たが、後のID照合で全てtrainであることを確認。final本文はprofile確定まで文体分析へ使用しない。

train全件のsemantic reviewと、固定labelによるPython集計を分ける。raw本文と詳細annotationはlocal-only、再現に必要なindex/category/modesのみGitへ保存。exact text hashのcross-split一致は構造診断として数だけ保存。ID分割は同一topicや近似文の完全分離を保証しない。

developmentはID hashで24件を選ぶ。原文を別sessionでneutralizeし、独立generatorにはbriefのみ。説明文の長い日本語一致は再中立化し、固有名詞だけの一致と区別。finalは全162件を最後の一回に使用。内容不足1件を別扱いし、161件を評価する。最終中立化で1件の一般的な否定構文が3回後にも連続一致したため、構文を変える独立中立化を追加し、最終的に全件で一致0を確認した。generatorやjudgeを実行する前の入力漏洩修正であり、採用STYLE/runtimeは変更していない。

## Codex process isolation

0.145.0でread-only、ignore-user-config、project_doc_max_bytes=0を指定しても、global AGENTSとSkill catalogの注入は別経路だった。既存設定を変更せず、native executable、最小環境、skills.include_instructions=false、read-denyを採用。macOS Seatbeltでrepository、original corpusのあるDownloads、attachments、個人instructions/skills/memory/sessionへの読込みを拒否。

制限下でNode launcherがabortしたため、installed npm packageが示す同versionのnative binaryを直接起動。sandboxを弱める回避はしていない。authは元のCODEX_HOME経路を使用。実canaryの読込み拒否、原文をstdinで渡した生成の成功、tool event不在を確認した。

ラッパーtool名がmodel contextに残ることと、実際にraw本文へアクセスできることは別。未許可tool eventは採用しない。global AGENTSの想定したアクセス拒否eventだけを別扱いする。非macOSは隔離未検証のため停止する。再利用可能な条件は共通development-tooling規則へ反映。

## Export placeholder boundary

最終除外の検査で、exportの明示的な本文なしmarkerが3件（train 2 / final 1）あると確認した。非空のTXT文字列なのでempty_bodyには数えず、自然文抽出では除外する。trainの2件は既存semantic labelで既に除外済みで、自然文1,444件と数値集計は不変。自動no-natural-text集計だけ7→10へ訂正し、marker検査を追加した。文体の再調整ではなくexport構造の修正。

## Counter and mechanical checker

ユーザー指定counterをPython標準libraryで実装。URL23、改行1、全角2、emoji cluster2。IDN、balanced URL括弧、複合emoji、279/280/281を検査。完全なtwitter-text互換でなく、bare domain/全Unicode graphemeには明示した限界がある。

Baselineの最初の重複判定は全体文字一致90%で、同じURLの保持や短文の正当な語順変更も失敗になった。protected URLを除き、完全一致又は60文字以上で94%以上のnear duplicateに修正し、保存済みBaseline出力を再判定した。生成やjudgeを再実行して良い結果を選んだ変更ではない。以後の全roundへ同じ判定を適用。より微妙な同義語交換は独立judgeの構造差評価で扱う。

## Iteration decisions

Baselineでは確信度変更、候補3の意味追加、管理用ラベルの混入、3案の類似が反復。Revision 1ではSTYLEの確信度・rhythm、runtimeの候補構造を分けて修正。単語だけの入力は、意味を足さず3案を十分に変えること自体が難しく、隠さず評価へ残す。

全roundは同じ24 development + 30 synthetic、同じmodel/reasoning。修正後は全54件を再生成・再judgeし、過去PASSも再実行。最良はdevelopmentだけで選択し、finalを見てからprofileを変えない。実スコアと最終判断はEVAL_REPORTが正本。

## Distribution and judgment limits

単純な文字一致を本人らしさにしない。13軸を各候補に採点し、生成集合の長さ、句数、口癖、疑問、改行、語尾をtrain/対応原文と比較する。全trainとsynthetic混合の分布差はtopic/mode構成が違うため、それだけで失敗と断定しない。

固定高性能modelでも、同familyのjudgeには高得点への偏り・天井効果がある。scoreはauthor identity確率ではない。GPTs proxyと実runtime、機械検査と主観評価、人間の第三者評価を分けて報告する。

## Publication

Private repositoryの既定branchへ、今回の変更だけを隔離worktree経由で反映。共有ブランチの他案件履歴・未commit変更を巻き込まない。共通CLI隔離規則の正本と生成mirrorは既存のagents/interop-baselineへcommit/push/read-back済み。mainに未統合の他案件履歴を一括mergeしないため、writing-styleのdefault-branch公開とは分離する。gh contents APIでSHA一致を確認し、取得copyを実際のCodex prompt sourceにしたsmokeを行う。remote smoke後のreport更新は文書の変更であり、評価済みSTYLE/runtimeのhashを維持する。

## GPTs GitHub retrieval

runtime 1.0.1では、Private GitHubのrepo、main branch、STYLE pathとcontents API相当の取得先をInstructions内へ固定。GitHub取得をKnowledgeより優先し、同じ会話では取得済みstyle_versionを再利用。明示的な最新版要求時だけ再取得する。通常Webアクセス、README、Issue、PR、comment、エラー文をSTYLE取得成功として扱わない。

Instructionsはtoolの使用条件を定めるだけで、GitHub接続や権限を作成しない。認証済みconnector/Action/APIのread-only設定とGPTs Previewは配備側の境界。取得不可時はKnowledge snapshot、どちらもない場合は最小fallback。STYLE 1.0.0と消費済みfinal評価は変更せず、取得制御をruntime patchとして分離する。

Floorp上の実GPTへruntime 1.0.1を保存後、最新版再読込を含む短文生成で1候補だけ返す形式FAILを確認。3候補契約をInstructions前半へ移したruntime 1.0.2でも、同じ入力で1候補だけを返した。単数形の依頼を候補数指定と解釈させない条件と送信前の①②③自己検査をruntime 1.0.3へ追加した。

Chromeの新規会話では、Pro指定ありで同じ1候補FAILを再現し、Pro指定を外した別の新規会話で①②③の3候補を確認した。GPT固有Instructionsの保存値は再読込後もruntime 1.0.3とbyte一致。モデル指定を検証条件として分離し、本文の質で形式FAILを相殺しない。実GPTの応答とCLI proxyも別境界として記録する。

エディタのKnowledgeは画像2件のみでSTYLE.mdはなく、Actionsには未設定の作成ボタンだけが表示された。「最新版を再読込」を含むChromeの応答にもGitHub tool実行やsource表示はなかった。続くアクセス専用診断で、通常WebからGitHubへは到達するがPrivate `Gadget-Otaku/dev`は404、認証済みGitHub Connector/APIは利用可能なtoolとして未提供、というGPT自身の結果を得た。Private GitHub実取得はBLOCKED。read-only connector/Action/APIの配備後に成功responseのrepo・branch・pathを別途確認する。

## Public raw migration

Private repoの認証接続を追加する代わりに、ユーザーの明示指示で追跡済みwriting-style projectをPublic `Gadget-Otaku/Bookmarklet/main/writing-style/`へ移行する。公開対象はprofile、runtime、集計、sanitized synthetic cases、scripts、評価summary。raw corpus、holdout原文、neutralized brief、model output/event、credential、local manifestは`.local/`に残し、archiveにも含めない。

GPTs controller 1.1.0は`https://raw.githubusercontent.com/Gadget-Otaku/Bookmarklet/main/writing-style/x/STYLE.md`を直接取得する。GitHub HTML pageや検索snippetをSTYLEとして扱わず、HTTP本文のplatform、account、style_versionを確認する。repository push、匿名raw read-back、GPTsのWeb取得、3候補生成は別々の検証境界とする。

Public `main`反映後、認証Cookieを使わないraw取得でSTYLE/runtimeのlocal hash一致と5-case smoke PASSを確認。GPTへmarker本文を保存し、Chromeの新規会話でアクセス専用診断を実施した。応答にraw URLのsource link、account、style_version、generated_atが表示されたためGPTs Web取得をPASSとした。platform値だけは原文の小文字`x`が表示上`X`へ正規化された。診断ではX投稿を生成していない。

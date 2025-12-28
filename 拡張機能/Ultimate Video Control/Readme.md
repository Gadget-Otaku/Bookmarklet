# Ultimate Video Control (UVC)

YouTubeをはじめとする動画サイトでの視聴体験を劇的に向上させる、多機能ビデオコントローラー拡張機能です。
モバイル版YouTube (`m.youtube.com`) とデスクトップ版 (`www.youtube.com`) の両方に最適化されており、速度調整、画質固定、ダウンロード連携、コメント検索・翻訳機能などを一つのパネルで管理できます。

## 🌟 主な機能

* **万能コントローラー**:
    * **再生速度**: 0.1倍単位の微調整、プリセットボタン (0.25x, 1x, 2x, 3x, 4x) による即時変更。
    * **画質固定**: 480p, 720p, 1080p, 4k にワンタップで切り替え・設定保存。
    * **シーク機能**: 秒・分・時単位での指定ジャンプ、前後スキップボタン。
* **YouTube特化機能**:
    * **Return YouTube Dislike (RYD) 連携**: 低評価数（👎）とその割合を表示します。
    * **コメント検索 & フィルター**:
        * キーワード検索
        * 人気順 / 新しい順 ソート
        * **言語フィルター**: 日本語、英語、中国語、韓国語、ロシア語のコメントのみを抽出して表示。
    * **コメント翻訳**: 外国語のコメントの下に、自動的に日本語訳を表示します (GAS連携)。
    * **字幕コピー**: 動画の字幕（文字起こし）をワンクリックでクリップボードにコピー。
* **ダウンロード連携**:
    * モバイル: Soul Browser または NewPipe と連携。
    * PC: `yt-dlp` 用のダウンロードコマンドを生成・コピー。
* **ドメイン別設定保存**: サイトごとに好みの速度や画質を「標準設定」として記憶させることができます。

## 📥 インストール方法

お使いのブラウザに合わせてファイルをダウンロード・インストールしてください。

### 🟣 Chromium系ブラウザをお使いの方
**対象**: Google Chrome, Brave, Microsoft Edge, Vivaldi, Opera など

1.  [/dist](https://github.com/Gadget-Otaku/Bookmarklet/tree/main/%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD/Ultimate%20Video%20Control/dist)から **`.zip` ファイル** をダウンロードし、解凍（展開）してください。
2.  ブラウザの拡張機能管理ページを開きます。
    * Chrome/Brave/Edge: `chrome://extensions`
3.  右上の **「デベロッパーモード」** をオンにします。
4.  **「パッケージ化されていない拡張機能を読み込む」** (Load unpacked) をクリックします。
5.  解凍したフォルダ（`manifest.json` が入っているフォルダ）を選択するとインストールされます。

### 🦊 Firefox系ブラウザをお使いの方
**対象**: Firefox Nightly, LibreWolf, Zen Browser, Floorp, Iceraven など

1.  [/dist](https://github.com/Gadget-Otaku/Bookmarklet/tree/main/%E6%8B%A1%E5%BC%B5%E6%A9%9F%E8%83%BD/Ultimate%20Video%20Control/dist)から **`.xpi` ファイル** をダウンロードしてください。
2.  `about:config`を開き、`xpinstall.signatures.required`と入力し、値を`false`に変更します。(初回のみ)
3.  ブラウザの設定メニューから「アドオンとテーマ (`about:addons`)」を開きます。
4.  歯車アイコン ⚙️ をクリックし、**「ファイルからアドオンをインストール」** を選択します。
5.  ダウンロードした `.xpi` ファイルを選択してインストールしてください。

> **注意**: 通常のFirefox安定版では、未署名のアドオンを永続的にインストールできません。開発者用エディション (Developer Edition) や Nightly、または Floorp などの派生ブラウザを使用することを推奨します。

## ⚙️ 初期設定 (API連携)

この拡張機能の全機能（コメント検索・翻訳）を使用するには、以下の設定が必要です。

### 1. YouTube Data API Key の設定
コメントを検索・取得するために必要です。

1.  [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、Googleアカウントでログインします。
2.  「プロジェクトの作成」から新しいプロジェクトを作成します。
3.  メニューの「APIとサービス」→「ライブラリ」を開き、**「YouTube Data API v3」** を検索して「有効にする」をクリックします。
4.  「認証情報」→「認証情報の作成」→ **「APIキー」** を選択します。
5.  生成されたキー（`AIza`から始まる文字列）をコピーします。
6.  拡張機能のパネルを開き、⚙️アイコン → 「Youtube Data API」へ進み、キーを貼り付けて保存してください。

### 2. 翻訳機能 (Google Apps Script) の設定
コメントを無料で日本語に翻訳するために、Google Apps Script (GAS) を利用します。

1.  [Google Apps Script](https://script.google.com/) にアクセスし、「新しいプロジェクト」を作成します。
2.  エディタに以下のコードを貼り付けます（元のコードはすべて削除してください）。

    ```javascript
    function doGet(e) {
      var text = e.parameter.text;
      var result = "";
      if (text) {
        try {
          // 日本語(ja)へ翻訳
          result = LanguageApp.translate(text, "", "ja");
        } catch(e) {
          result = "Error";
        }
      }
      var output = { translation: result };
      return ContentService.createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON);
    }
    ```

3.  画面右上の **「デプロイ」** → **「新しいデプロイ」** をクリックします。
4.  歯車アイコンから **「ウェブアプリ」** を選択します。
5.  以下の設定にして「デプロイ」します（**重要**）：
    * **次のユーザーとして実行**: 自分 (Me)
    * **アクセスできるユーザー**: **全員 (Anyone)**
6.  発行された **ウェブアプリのURL** (`https://script.google.com/macros/s/.../exec`) をコピーします。
7.  拡張機能のパネルを開き、⚙️アイコン → 「翻訳設定 (GAS URL)」へ進み、URLを貼り付けて保存してください。

## 📱 使い方

### パネルの開き方
* **PC / タブレット**: 動画画面上にマウスを乗せると、左上に半透明の **⚙️ (歯車)** アイコンが表示されます。これをクリックします。
* **モバイル (m.youtube.com)**: 画面上のどこかに、四角い **ハンバーガーメニュー (≡)** が表示されます。これをタップします（位置は設定で変更可能）。

### 基本操作
* **標準設定**: 「標準設定」にチェックを入れると、現在のサイト（ドメイン）に対して、今の再生速度と画質設定を記憶します。次回アクセス時に自動適用されます。
* **ダウンロード**: ⬇️アイコンを押すと、環境に応じたダウンロードアクションを実行します（Androidでは外部アプリ連携、PCではコマンド生成）。
* **字幕コピー**: 📝アイコンを押すと、動画の全字幕を取得してクリップボードにコピーします。
* **RVX切り替え**: Youtubeアイコンを押すと、RVX(Revanced)に自動で切り替わり、現在開いている動画ページをRVXで見ることができます。

---
**Disclaimer**: This extension is for personal use and educational purposes.

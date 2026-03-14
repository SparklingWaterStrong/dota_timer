# Dota 2 Timer

Dota 2 の試合中に、ロータス・ルーン・昼夜サイクルなどの出現タイミングを追跡する Web アプリです。  
ブラウザだけで動作するため、インストール不要で手軽に使えます。

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)

---

## 機能

- **主要オブジェクトタイマー**
  - **ロータス**（3:00）
  - **知恵の祠**（7:00）
  - **バウンティールーン**（4:00）
  - **パワールーン**（2:00）
  - **昼夜サイクル**（5:00）

- **試合時間表示** … 実質の試合経過時間（開始40秒後からカウント）
- **昼夜表示** … 現在が昼/夜かを表示
- **±10秒調整** … 誤差が出たときに手動で補正可能
- **メモ**
  - テキスト欄でローテーションなどのメモを記録（ローカルストレージに自動保存）
  - **ファイルから読み込み** … `.txt` を選択してメモを読み込み（ファイルが無い・読み込み失敗時もエラーにしない）
  - **ファイルに保存** … メモを `dota_timer_memo.txt` としてダウンロード
  - ローカル（`file://`）で開いた場合も同じように読み書き可能
- **カスタムアイコン** … 各タイマーに任意の画像を設定可能（設定はローカルストレージに保存）

---

## 使い方

### 開発サーバーで起動

```bash
npm install
npm run dev
```

ブラウザで表示された URL（通常は http://localhost:5173）を開きます。

### 本番ビルド

```bash
npm run build
```

`dist/` にビルド結果が出力されます。`vite-plugin-singlefile` により、JS/CSS がインライン化された単一の `index.html` が生成され、そのまま配布・ローカルで開けます。

### ビルド結果のプレビュー

```bash
npm run preview
```

http://localhost:4173 でビルド済みのアプリを確認できます。

---

## サイトアイコン（ファビコン）の配置

ブラウザのタブなどに表示されるサイトアイコンは **`public/` フォルダ** に置きます。

| 置く場所 | 説明 |
|----------|------|
| `public/favicon.svg` | 現在参照しているアイコン（SVG）。このファイルを差し替えれば反映されます。 |
| `public/favicon.ico` | 従来形式。使う場合は `index.html` の `<link rel="icon">` を `.ico` 用に変更してください。 |

- **Vite** では `public/` 内のファイルがそのままルートパスで配信されます（例: `public/favicon.svg` → `/favicon.svg`）。
- `index.html` の `<head>` で `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` のように参照しているので、**`public/favicon.svg` を用意するか、同じパスで別形式（例: `favicon.ico`）にした場合は `index.html` の `href` を合わせて変更**してください。

---

## 技術スタック

- **React 19** + **TypeScript**
- **Vite 8**（ビルド・開発サーバー）
- スタイルは CSS（昼夜でテーマ切り替え）

---

## ライセンス

### 本プロジェクトのソースコード

本リポジトリの**ソースコード**は [MIT License](LICENSE) で提供されています。

- **利用** … 個人・商用を問わず自由に利用できます。
- **改変・再配布** … 改変しての利用や再配布が可能です。
- **保証** … 無保証です。利用により生じた損害について、作者は責任を負いません。
- **表示** … 再配布時は LICENSE ファイル（または MIT の条文）の保持・著作権表示が条件です。詳細は [LICENSE](LICENSE) を参照してください。

### サードパーティのライセンス

本プロジェクトは以下のオープンソースライブラリを使用しています。それぞれのライセンスに従って利用してください。

| パッケージ | 用途 | ライセンス |
|------------|------|------------|
| React / React DOM | UI ライブラリ | [MIT](https://github.com/facebook/react/blob/main/LICENSE) |
| Vite | ビルドツール | [MIT](https://github.com/vitejs/vite/blob/main/LICENSE) |
| TypeScript | 型付け・トランスパイル | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| その他 devDependencies | 開発・Lint 等 | 各パッケージの LICENSE を参照 |

`npm run build` 後に `node_modules` 内の各パッケージの `LICENSE` ファイルで内容を確認できます。

### Dota 2 および商標について

- **Dota 2** は Valve Corporation の登録商標です。
- 本プロジェクトは **Valve および Dota 2 と公式に提携・関連したものではありません**。ファンによる非公式のツールです。
- ゲーム内のルール・タイミング（ロータス、ルーン、昼夜など）は Dota 2 の仕様に基づいており、それらの情報の正確性やゲーム利用規約との整合性は利用者自身で確認してください。

---

## 貢献・フィードバック

バグ報告や機能要望、プルリクエストは Issue / Pull Request で歓迎します。

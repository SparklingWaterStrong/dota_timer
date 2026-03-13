# Dota 2 Timer

Dota 2 の試合中に、ロータス・ルーン・昼夜サイクルなどの出現タイミングを追跡する Web アプリです。

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)

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
- **メモ** … ローカルストレージに保存されるメモ欄（ローテーションなど）

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

`dist/` にビルド結果が出力されます。`vite-plugin-singlefile` により、単一 HTML ファイルとしても出力可能です。

### プレビュー

```bash
npm run preview
```

## 技術スタック

- **React 19** + **TypeScript**
- **Vite 8**（ビルド・開発サーバー）
- スタイルは CSS（昼夜でテーマ切り替え）

## ライセンス

Private リポジトリのため、利用・改変はリポジトリの設定に従ってください。

# School Dock

Status: Archived / Local Use

School Dock は現在ローカル運用へ移行しました。

本リポジトリは学校生活支援アプリの実験・研究用として維持します。
公開運用は終了しました。

今後は公開サービスではなく、学校向け機能の研究所として利用します。

## 主な機能

- 黒板OCR
- 教材ライブラリ
- 提出物管理
- 行事取得
- 時間割管理
- 黒板メモ
- 行事カウントダウン
- School Dock News

## ローカル起動

インストール:

```bash
npm install
```

起動:

```bash
npm run dev
```

アクセス:

```text
http://localhost:3000
```

## スマホ確認

同一Wi-Fi内でPCから起動します。

```bash
npm run dev -- --hostname 0.0.0.0
```

PCのIPアドレスを確認します。

Windows:

```powershell
ipconfig
```

例:

```text
192.168.1.5
```

スマホから以下へアクセスします。

```text
http://192.168.1.5:3000
```

## 確認コマンド

lint:

```bash
npm run lint
```

build:

```bash
npm run build
```

## 運用メモ

- データはブラウザのlocalStorageに保存します。
- 通常利用に環境変数は不要です。
- 黒板画像読み取りは無料のブラウザ側Tesseract.js OCRを標準で使います。
- `OPENAI_API_KEY` が設定されている場合のみ、サーバー側のOpenAI Vision解析を利用できます。
- GitHubリポジトリはバックアップ、ポートフォリオ、将来の再公開に備えて維持します。
- Vercelプロジェクトの削除はこのリポジトリでは行いません。必要な場合はユーザーがVercel側で手動実施します。

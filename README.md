# 大槻繁のnoteメッセージ紹介サイト

大槻繁（1_s_o / 大槻一史）が [note.com](https://note.com/ichi_s_otsuki) に発表してきた論考・エッセイのメッセージを紹介する公開Webサイトです。

## サイト構成

| セクション | 内容 |
|---|---|
| ① 目的 | サイトの目的・著者紹介 |
| ② 記事インデックス | 全124本の記事一覧（NoteIdx.pdf） |
| ③ 主要メッセージ | 知働化の原則20条（Principle.pdf） |
| ④ デザイン資料 | 知働化経営の哲学（PDF・サムネイル付き） |
| ⑤ お問い合わせ | 株式会社一（いち）CONTACTページへリンク |

## ファイル構成

```
notesite/
├── index.html              # メインページ
├── css/
│   └── style.css           # スタイルシート（レスポンシブ対応）
├── js/
│   └── main.js             # スクロール・ハンバーガーメニュー等
└── assets/
    ├── pdfs/
    │   ├── NoteIdx.pdf             # 記事インデックス（124件）
    │   ├── Principle.pdf           # 格言・教え集（20条）
    │   └── 知働化経営の哲学.pdf    # デザインされたメッセージ資料
    └── images/
        └── chidoka_thumb-01.png    # PDFサムネイル（第1ページ）
```

## デプロイ

### Vercel（推奨）

1. [Vercel](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New Project」→ このリポジトリ（NoteSite）を選択
3. Framework Preset: **Other**（静的HTML）
4. Build & Output Settings: デフォルトのまま
5. 「Deploy」をクリック → 自動でhttps://notesite.vercel.app 等のURLが発行される

### その他の選択肢

| サービス | 特徴 |
|---|---|
| **GitHub Pages** | 無料・簡単・GitHub連携。リポジトリ設定からPages有効化するだけ |
| **Netlify** | ドラッグ&ドロップでも可。フォーム機能付き |
| **Cloudflare Pages** | 高速CDN・無料帯域無制限 |

## 関連リンク

- note.com: https://note.com/ichi_s_otsuki
- 株式会社一（いち）: https://1corp.biz
- お問い合わせ: https://1corp.biz/primary2026/contact.html

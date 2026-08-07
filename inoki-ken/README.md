# inoki-ken サイト（Vercel / Node.js版）

`https://chidouka-lab.com/inoki-ken/` として公開するための一式です。

このサイトは、もともとPHPで作られていましたが、`chidouka-lab.com` は Vercel でホスティングされており
PHPを実行できないため、Node.js（Vercelのサーバーレス関数）＋静的HTMLに書き換えてあります。

---

## 1. 構成

```
notesite/                       ← リポジトリのルート
├── api/
│   └── inoki-ken.js             ← ID/SubID認証・管理画面用のAPI（Vercel Functions）
└── inoki-ken/
    ├── index.html                トップページ（ログイン画面を兼ねる）
    ├── concept/
    │   └── index.html            ArtOfThought.docx の内容
    ├── hypo/
    │   └── index.html            Hypo.docx の内容（五つの仮説）
    ├── admin/
    │   └── index.html            管理画面（ID・SubIDの追加/変更/削除）
    ├── assets/
    │   ├── style.css
    │   ├── site.js                絞り込み・理解チェックの動き
    │   └── img/                   図（PNG 5点）
    └── robots.txt                 検索エンジン除け
```

PHP版にあった `lib/`・`data/`・`.htaccess`・`*.php` は不要になったため削除しました。
ID/SubIDの一覧は、ファイルではなく Vercel の KV（Upstash Redis、キー `inoki-ken:users`）に保存します。

---

## 2. 使い方

### サイトを見る

`https://chidouka-lab.com/inoki-ken/`

ログイン画面が出ます。初期登録は次のとおりです（初回アクセス時に自動で登録されます）。

| 項目 | 値 |
|---|---|
| ID | `kogakuin` |
| SubID | `inoki-ken` |

ログイン状態は `sessionStorage` に保存されます。ブラウザのタブを閉じると解除されます
（同じタブ内であれば概念・仮説のページへ移動してもログインは保持されます）。

### IDを追加・削除する

`https://chidouka-lab.com/inoki-ken/admin/`

管理パスワードは、サイト共通の環境変数 `ADMIN_PASSWORD`（Vercelのプロジェクト設定）です。
他の管理画面（交流メンバ管理・ライブラリ管理など）と同じパスワードを使います。

- 一覧から SubID を直接書き換えて「変更」
- 下の欄に入力して「追加」
- 不要になったものは「削除」（最後の1件は削除できません）

入力の決まり：

- ID … 半角の英数字・ハイフン・アンダースコア・ピリオド、2〜40文字
- SubID … 4〜60文字

---

## 3. 内容を書き換えたいとき

### 仮説の文言を直す・命題を追加する

`inoki-ken/hypo/index.html` は静的HTMLです。命題の追加・修正はこのファイルを直接編集してください。
（もとのPHP版は `hypo/data.php` にデータを分離していましたが、Node/静的HTML化にともない
　`inoki-ken/hypo/index.html` に統合しています。件数が多いため、`.prop` ブロックの構造
　（`data-h`・`data-new` 属性）を保ったまま追記すると、絞り込み機能がそのまま働きます。）

### 概念の説明を直す

`inoki-ken/concept/index.html` を直接編集してください。ふつうのHTMLです。
よく使う型：

```html
<div class="box">          … 青い囲み
<div class="box warn">     … 橙の囲み（注意）
<div class="box phil">     … 紫の囲み（哲学の話）
<div class="define">       … 中央寄せの定義
```

---

## 4. デプロイ

このリポジトリ全体のルールに従います（`CLAUDE.md` 参照）。

```bash
git add .
git commit -m "..."
git push
vercel --prod --yes
```

Vercelのプロジェクトに、KV（Upstash Redis）連携と環境変数 `ADMIN_PASSWORD` が
設定済みであることが前提です（他の管理画面 `/admin.html` などと共通）。

---

## 5. 安全性についての注意

このサイトの認証は、**関係者以外がふらっと見ないようにするための簡易的な仕組み**です。

- ID・SubIDはハッシュ化せず、そのままKVに保存されます
- ログイン状態はブラウザの `sessionStorage` によるもので、サーバー側のセッション管理ではありません
- ページのHTMLソース自体には本文が含まれているため、ブラウザの「ページのソースを表示」を使えば
  ログインなしに内容を読むこともできてしまいます（PHP版のサーバーサイドレンダリングより保護は弱くなっています）
- 通信は必ず https で行ってください

機密性の高い情報は置かないでください。より強い保護が必要になった場合は、
Vercelの環境で使えるBasic認証や、Vercel Edge Middlewareでのアクセス制御を検討してください。

---

作成日：2026年8月7日（PHP版）／Node.js版への移行：2026年8月7日
内容の出典：ArtOfThought.docx ／ Hypo.docx（いずれも『小西さん卒論関連のまとめ』にもとづく）

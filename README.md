# カゴシマ メディアポータル

カゴシマニアックス／プレスリリースかごしま／カゴシマーケティング／かごしま情報ブログの、サイトとSNSをまとめた静的ポータル。Astro で生成し、GitHub Pages で公開する想定です。

試作の1枚 HTML は `prototype/index.html` に残してあります。

## リンクの直し方

サイト名・URL・SNS・入口リンク・目的別ナビは **`data/sites.json` だけ** 直します。ページはビルド時にそこから生成されます。

1. `data/sites.json` を編集する
2. 確認できていない SNS は足さない（空欄のまま）
3. `npm run build` で静的ファイルを出す
4. `npm run check:links` で内部リンクを確認する

新着記事の本文は各 WordPress 側にあります。ポータル側ではタイトル・日付・抜粋・URL だけ持ちます。

## フィードの更新方法

公開 REST（失敗時は RSS）を読み、`data/latest.json` に書き出します。認証は使いません。

```bash
npm run fetch:latest
```

- 公開済み記事だけ取得します
- 1サイトでも失敗したら、そのサイトは前回の JSON を残します
- カゴシマニアックスの配信フィード設定は変更しません（読み取りのみ）

GitHub Actions は 1日4回（UTC 0/6/12/18時台）と手動実行で同じ処理をします。

- `.github/workflows/fetch-feed.yml` … JSON をコミット（内容が変わったときだけ）
- `.github/workflows/deploy.yml` … 取得 → ビルド → Pages へデプロイ（取得失敗でもビルドは続ける）

## デプロイ手順

リポジトリ作成・push・Pages 有効化は、運営者の承認後に行います。ローカルでは:

```bash
npm install
npm run fetch:latest
npm run build
npm run preview
```

想定公開 URL: `https://boraemon2000.github.io/kagoshima-portal/`

GitHub 側（承認後）:

1. `boraemon2000/kagoshima-portal` を public で作成して push
2. Settings → Pages → Source を GitHub Actions にする
3. `deploy.yml` が通れば Pages に出る
4. 独自ドメインを使う場合は `SITE_URL` と `BASE_PATH` をワークフローで差し替える

リポジトリにトークンや `.env` は置きません。

## 構成

| パス | 内容 |
|---|---|
| `/` | トップ |
| `/niax/` `/news/` `/mkt/` `/blog/` | メディア案内 |
| `/sns/` | SNS マトリクス |
| `/guide/` | 目的別ナビ |
| `/latest/` | 横断新着 |
| `/for-business/` | 事業者向け（先方フォームへ） |
| `/about/` | 運営方針 |

受け入れ前のファクトチェック観点は `docs/FACTCHECK.md` と `AI-HANDOFF.md` 第5章です。

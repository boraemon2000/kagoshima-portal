# AI-HANDOFF: カゴシマ メディアポータル（Cursor 実装用）

作成: 2026-11-11 / 作成者: Claude Code / 実装担当: Cursor（リードエンジニア）

## 0. ゴール

鹿児島の自社4メディアのサイトとSNSをまとめた**ポータルサイト**を、GitHub Pages で公開する。
現状の `index.html`（1枚のLPプロトタイプ）を土台に、**ボリュームのある多ページのサイト**へ育てる。
目的は (1) 4メディア間の相互送客、(2) 「鹿児島の情報メディア群」としてのブランド集約、(3) SNSフォロー導線の一本化。

## 1. 対象メディア（この4つだけ）

| 識別 | 名称 | URL | 役割 | 色（暫定） |
|---|---|---|---|---|
| niax | カゴシマニアックス | https://kagoshimaniax.com/ | グルメ・新店・イベントのローカル情報（コンテンツ/SEOエンジン） | 赤 #d92b2b × 黄 #ffd23f |
| news | プレスリリースかごしま | https://kagoshima.news/ | 鹿児島発のプレスリリース配信サイト。広報・PR実践コラムも連載 | 青 #1d4ed8 |
| mkt | カゴシマーケティング | https://kagoshimarketing.com/ | 中小企業・店舗向けの地域マーケティング・統計データ解説 | 緑 #0f8a6c |
| blog | かごしま情報ブログ | https://kagoshima.blog/ | 自治体・公式サイトの発表を出典と日付つきで確認して届ける。週まとめ「今週の鹿児島」 | オレンジ #e0680b |

**載せてはいけないもの**: 八光（hakko-eco.com / fuyouhin-hakko.jp）、はやかわクリニック（hayakawa.clinic）などクライアント案件、boraemon.jp（個人サイト）。ポータルには一切出さない。

## 2. SNS（確認済みのもののみ。`data/sites.json` に一元管理）

- niax: Instagram `kagoshimaniax` / Instagram（チェーン店特化）`kagoshimaniax_jpn` / X `kagoshimaniax` / Facebook `kagoshimaniax` / YouTube channel `UCxB4gSD41l4Eg7Xj2rNx-DQ` / TikTok `@kagoshimaniax` / LINE `@oa-kagoshimaniax` / note `kagoshimaniax`
- news: Instagram `pressrelease.kagoshima` / X `press_kagoshima` / Facebook `pressrelease.kagoshima`
- mkt: Instagram `kagoshimarketing` / X `kgsm_marketing` / Facebook `profile.php?id=1217703081436502`
- blog: Instagram `kagoshima_blog` / X `kagoshima_blog` / YouTube channel `UCBS1fZ9UyZw2Ez43GJklIAQ`

**未確定（中園さんに確認してから足す。推測で書かない）**:
- niax の Facebook は `facebook.com/kagoshimaniax`（サイトのフッター）と `kagoshimaniax2`（過去メモ）で食い違い。どちらが現行か要確認
- blog の Facebook、mkt の YouTube、各媒体の Threads/Bluesky

## 3. 作りたいサイトの構成案（ボリューム重視）

Cursor 側で情報設計を詰めてよい。最低限、次を想定する。

1. **トップ**: ヒーロー、4メディアのカード、新着記事フィード（後述）、SNSまとめ、「どれを見ればいい？」ガイド、各メディアの代表コンテンツ
2. **メディア紹介ページ ×4**（`/niax/` `/news/` `/mkt/` `/blog/`）: 何を扱うか、読み方、人気カテゴリへの入口、そのメディアのSNS、関連する他メディアへの誘導
3. **SNS一覧ページ**（`/sns/`）: 媒体×プラットフォームのマトリクス、フォロー導線
4. **目的別ナビ**（`/guide/`）: 「お店を探したい」「プレスリリースを出したい」「集客を学びたい」「行政情報を確認したい」→ 最適なメディアへ
5. **新着フィード**（`/latest/`）: 4メディアの最新記事を横断表示（下の「動的データ」参照）
6. **プレスリリースを出したい方へ**（`/for-business/`）: news と mkt への導線。問い合わせ先は各サイトの既存フォームへリンク（ポータルにフォームは作らない）
7. **このポータルについて / 運営方針**（`/about/`）: 運営の考え方、各メディアの編集方針の要約。**編集長・運営者の個人名は出さない**
8. 共通: ヘッダー/フッター、パンくず、404、sitemap.xml、robots.txt、OGP/構造化データ（Organization, WebSite）

## 4. 技術方針

- ホスティング: **GitHub Pages**（リポジトリは public。`boraemon2000/kagoshima-portal` を想定。リポジトリ作成と公開は中園さんの承認後）
- 静的サイトジェネレータは Cursor が選んでよい（Astro / Eleventy / Vite + 素のHTML など）。条件: ビルド成果物が静的ファイルであること、`.github/workflows` から GitHub Actions でデプロイできること
- データ駆動にする: サイト・SNS・説明文は `data/sites.json`（または同等）に集約し、ページはそこから生成。リンク修正を1か所で済ませる
- 日本語フォントは Google Fonts（Zen Maru Gothic / Noto Sans JP）。現プロトタイプのトークンを踏襲しつつ拡張してよい
- ライト/ダーク両対応、スマホ優先（375px幅で横スクロールなし）、アクセシビリティ（コントラスト、フォーカス、`prefers-reduced-motion`）
- 外部リンクは `target="_blank" rel="noopener"`。パフォーマンス目標は Lighthouse 90+（モバイル）

### 動的データ（新着記事フィード）

- 4サイトはいずれも WordPress。ビルド時（GitHub Actions の定期実行、例: 1日数回）に、各サイトの公開 REST API（`/wp-json/wp/v2/posts?per_page=…&_fields=title,link,date,excerpt,featured_media`）または RSS を取得し、静的JSONに書き出して反映する
- 取得するのは**公開済み記事のみ**。下書き・非公開は絶対に出さない
- API に認証情報は使わない（公開エンドポイントのみ）。**リポジトリに秘密情報・トークンを置かない**（public repo のため）
- 取得失敗時は前回のJSONを保持してビルドを落とさない
- カゴシマニアックスの RSS は配信フィード（Gunosy/LINE/SmartNews 向け）が別にある。**サイトのフィード設定には触らない**（読み取りだけ）

## 5. コンテンツ・表現のルール（必須）

- **数字を盛らない**: フォロワー数・PV・記事数などは、実測の出典がある場合のみ掲載する。出典のない数字・実績・受賞歴・導入企業ロゴは載せない（プレースホルダーも不可）
- 「鹿児島No.1」など根拠のない最上級表現は使わない
- 医療広告ガイドライン案件（はやかわクリニック）を連想させる記述・リンクは入れない
- 店舗名・イベント情報を例として載せる場合は、実在して営業中であることを元記事で確認する。確認できなければ載せない
- 画像は各メディアの公式ロゴ・OG画像など権利が明確なものだけ。他サイトの記事画像を無断で転載しない。画像がなければ色とタイポグラフィで構成する
- キャラクター「ブラピさん」（黒豚・白いはちまき・黄シャツ）はカゴシマニアックス専用。ポータル全体のマスコットにはしない
- 文体: 親しみやすく、やわらかく。AIっぽい定型表現（「〜をご紹介します」の連発など）を避ける

## 6. 受け入れ条件（Definition of Done）

- [ ] 上記ページ群が生成され、全リンクが 200 を返す（リンクチェックのスクリプトを `scripts/` に置く）
- [ ] 4メディア×SNSのリンクが `data/sites.json` と一致し、未確定項目は載っていない
- [ ] 新着フィードが GitHub Actions で自動更新される（失敗時フォールバックあり）
- [ ] 375px / 768px / 1280px で崩れない。ライト/ダーク両方を確認
- [ ] Lighthouse モバイル 90+、sitemap.xml・robots.txt・OGP が出る
- [ ] README に「リンクの直し方」「フィードの更新方法」「デプロイ手順」を書く
- [ ] 公開前に Claude / 別AI（Antigravity か ChatGPT）がファクトチェック（第5章の観点）を行える状態にする

## 7. 現状

- `index.html` … 1ページのプロトタイプ（4カード＋SNSチップ）。ローカルでgit初期化・1コミット済み、**GitHubには未push**
- デザイントークン（カード配色・角丸・フォント）は `index.html` の `<style>` を参照
- 運用は「提案→承認→実行」。公開リポジトリの作成・push・Pages有効化は中園さんの承認を取ってから

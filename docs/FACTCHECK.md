# 公開前ファクトチェック

別AI（Claude / ChatGPT / Antigravity）が、`AI-HANDOFF.md` 第5章の観点で確認するためのメモです。数字の出典、個人名、載せていけないサイト、未確定SNSが混ざっていないかを見てください。

## 見る場所

- 正本データ: `data/sites.json`
- 新着: `data/latest.json`（公開APIから自動。本文は各サイト）
- 生成ページ: `src/pages/`（文言の大半は JSON 由来）

## 載せてよいメディア（4つのみ）

- カゴシマニアックス https://kagoshimaniax.com/
- プレスリリースかごしま https://kagoshima.news/
- カゴシマーケティング https://kagoshimarketing.com/
- かごしま情報ブログ https://kagoshima.blog/

## 載せていないもの（意図的）

- 八光、はやかわクリニック、boraemon.jp
- 運営者・編集長の個人名
- カゴシマニアックス Facebook（フッターと過去メモで食い違い）
- かごしま情報ブログ Facebook
- カゴシマーケティング YouTube
- Threads / Bluesky
- 出典のない PV・フォロワー数・受賞・導入企業ロゴ
- 「No.1」などの最上級
- 各サイト記事のアイキャッチ転載
- ポータルのマスコット（ブラピさんも含む）

## SNS（確認済みだけ）

`data/sites.json` の `sites[].sns` と、この表が一致していること。

| 媒体 | 載せる |
|---|---|
| niax | IG `kagoshimaniax` / IG `kagoshimaniax_jpn` / X / YouTube `UCxB4gSD41l4Eg7Xj2rNx-DQ` / TikTok / LINE / note |
| news | IG `pressrelease.kagoshima` / X `press_kagoshima` / Facebook `pressrelease.kagoshima` |
| mkt | IG `kagoshimarketing` / X `kgsm_marketing` / Facebook `profile.php?id=1217703081436502` |
| blog | IG `kagoshima_blog` / X `kagoshima_blog` / YouTube `UCBS1fZ9UyZw2Ez43GJklIAQ` |

## 事業者向けリンク（先方の既存ページ）

- https://kagoshima.news/submit
- https://kagoshima.news/pr-request-form
- https://kagoshima.news/contact
- https://kagoshimarketing.com/contact/
- https://kagoshimarketing.com/service/
- https://kagoshimaniax.com/ads/
- https://kagoshimaniax.com/keisaiirai/
- https://kagoshimaniax.com/contact/

料金・実績・症例はポータルに再掲していません。先方ページを見てください。

## コピー時に踏んではいけない文

カゴシマニアックス「について」ページの「鹿児島No.1を目指します」は、ポータルへ持ち込みません。
カゴシマーケティング案内ページのクリニック／不用品回収の事例も持ち込みません。

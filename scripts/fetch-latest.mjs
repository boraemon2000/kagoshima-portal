#!/usr/bin/env node
/**
 * Public WordPress REST (then RSS) → data/latest.json
 * No auth. On failure, keep the previous file / previous site slice.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitesPath = join(root, "data/sites.json");
const outPath = join(root, "data/latest.json");
const UA = "KagoshimaMediaPortal/1.0 (+https://boraemon2000.github.io/kagoshima-portal/; feed-fetcher)";
const PER_SITE = 8;
const TIMEOUT_MS = 12000;

function loadJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function decode(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(Number(n));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      try {
        return String.fromCodePoint(parseInt(n, 16));
      } catch {
        return "";
      }
    })
    .replace(/\s+/g, " ")
    .trim();
}

function excerptOf(text) {
  const t = decode(text).replace(/\s*\[[^\]]{0,12}\]\s*$/g, "").trim();
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "application/json, application/rss+xml, application/xml, text/xml, */*" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function fromRest(siteId, json) {
  const items = Array.isArray(json) ? json : [];
  return items
    .filter((p) => !p.status || p.status === "publish")
    .map((p) => ({
      siteId,
      title: decode(p.title?.rendered ?? p.title ?? ""),
      url: p.link,
      date: p.date,
      excerpt: excerptOf(p.excerpt?.rendered ?? ""),
      source: "rest",
    }))
    .filter((p) => p.title && p.url)
    .slice(0, PER_SITE);
}

function tag(xml, name) {
  const re = new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${name}>|<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = xml.match(re);
  return m ? (m[1] ?? m[2] ?? "") : "";
}

function fromRss(siteId, xml) {
  const items = xml.split(/<item[\s>]/i).slice(1);
  return items
    .map((chunk) => {
      const title = decode(tag(chunk, "title"));
      const url = decode(tag(chunk, "link"));
      const date = decode(tag(chunk, "pubDate") || tag(chunk, "dc:date"));
      const excerpt = excerptOf(tag(chunk, "description") || tag(chunk, "content:encoded"));
      let iso = date;
      const parsed = Date.parse(date);
      if (!Number.isNaN(parsed)) iso = new Date(parsed).toISOString();
      return { siteId, title, url, date: iso, excerpt, source: "rss" };
    })
    .filter((p) => p.title && p.url)
    .slice(0, PER_SITE);
}

async function fetchSite(site) {
  const restUrl = `${site.feed.rest}?per_page=${PER_SITE}&status=publish&_fields=title,link,date,excerpt,status`;
  try {
    const text = await fetchText(restUrl);
    const json = JSON.parse(text);
    const posts = fromRest(site.id, json);
    if (!posts.length) throw new Error("REST empty");
    return { ok: true, source: "rest", posts, error: undefined };
  } catch (restErr) {
    try {
      const xml = await fetchText(site.feed.rss);
      const posts = fromRss(site.id, xml);
      if (!posts.length) throw new Error("RSS empty");
      return { ok: true, source: "rss", posts, error: undefined };
    } catch (rssErr) {
      return {
        ok: false,
        source: null,
        posts: [],
        error: `REST: ${restErr.message}; RSS: ${rssErr.message}`,
      };
    }
  }
}

const sitesFile = loadJson(sitesPath, { sites: [] });
const prev = loadJson(outPath, { updatedAt: null, posts: [], sites: {} });
const now = new Date().toISOString();
const sitesState = {};

for (const site of sitesFile.sites) {
  const result = await fetchSite(site);
  const fetchedAt = now;
  if (result.ok) {
    sitesState[site.id] = {
      ok: true,
      source: result.source,
      fetchedAt,
      posts: result.posts,
    };
    console.log(`ok  ${site.id} via ${result.source} (${result.posts.length})`);
  } else {
    const kept = prev.sites?.[site.id]?.posts ?? prev.posts?.filter((p) => p.siteId === site.id) ?? [];
    sitesState[site.id] = {
      ok: false,
      source: prev.sites?.[site.id]?.source ?? null,
      fetchedAt: prev.sites?.[site.id]?.fetchedAt ?? null,
      error: result.error,
      posts: kept,
    };
    console.warn(`keep ${site.id}: ${result.error} (kept ${kept.length})`);
  }
}

const posts = Object.values(sitesState)
  .flatMap((s) => s.posts)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

const out = {
  updatedAt: Object.values(sitesState).some((s) => s.ok) ? now : prev.updatedAt,
  posts,
  sites: sitesState,
};

writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(`wrote ${outPath} (${posts.length} posts)`);

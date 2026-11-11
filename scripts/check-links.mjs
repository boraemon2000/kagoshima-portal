#!/usr/bin/env node
/**
 * Check internal (and optional external) links in dist/
 * Usage: node scripts/check-links.mjs [--external]
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const checkExternal = process.argv.includes("--external");
const BASE = "/kagoshima-portal";

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function fileFor(pathname) {
  let p = pathname;
  if (p.startsWith(BASE)) p = p.slice(BASE.length);
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.endsWith("/")) p += "index.html";
  const abs = join(dist, p.replace(/^\//, ""));
  if (existsSync(abs)) return abs;
  if (existsSync(join(dist, p.replace(/^\//, "") + ".html"))) {
    return join(dist, p.replace(/^\//, "") + ".html");
  }
  return null;
}

function extractHrefs(html) {
  const out = [];
  const re = /\b(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

if (!existsSync(dist)) {
  console.error("dist/ がありません。先に npm run build してください。");
  process.exit(1);
}

const htmlFiles = walk(dist).filter((f) => f.endsWith(".html"));
const internalMissing = [];
const skipExt = new Set();
const external = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const href of extractHrefs(html)) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) continue;
    if (href.startsWith("http://") || href.startsWith("https://")) {
      if (
        href.includes("fonts.googleapis.com") ||
        href.includes("fonts.gstatic.com") ||
        href.includes("schema.org") ||
        href.startsWith("https://boraemon2000.github.io/kagoshima-portal")
      ) {
        skipExt.add(href);
        continue;
      }
      external.add(href);
      continue;
    }
    const pathOnly = href.split("?")[0].split("#")[0];
    if (!fileFor(pathOnly)) {
      internalMissing.push({ file: file.replace(root + "/", ""), href });
    }
  }
}

let failed = internalMissing.length;
if (internalMissing.length) {
  console.error("内部リンク切れ:");
  for (const x of internalMissing) console.error(`  ${x.file} → ${x.href}`);
} else {
  console.log(`内部リンク OK（HTML ${htmlFiles.length} ファイル）`);
}

if (checkExternal) {
  const list = [...external];
  console.log(`外部リンクを確認します（${list.length}）`);
  for (const url of list) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      let res = await fetch(url, {
        method: "HEAD",
        signal: ctrl.signal,
        redirect: "follow",
        headers: { "User-Agent": "KagoshimaMediaPortal-linkcheck/1.0" },
      });
      if (res.status === 405 || res.status === 403 || res.status === 400) {
        res = await fetch(url, {
          method: "GET",
          signal: ctrl.signal,
          redirect: "follow",
          headers: { "User-Agent": "KagoshimaMediaPortal-linkcheck/1.0" },
        });
      }
      clearTimeout(t);
      if (res.status >= 400) {
        console.error(`  FAIL ${res.status} ${url}`);
        failed += 1;
      } else {
        console.log(`  ${res.status} ${url}`);
      }
    } catch (err) {
      console.error(`  ERR  ${url} (${err.message})`);
      failed += 1;
    }
  }
} else {
  console.log(`外部リンク ${external.size} 件（--external で生存確認）`);
}

process.exit(failed ? 1 : 0);

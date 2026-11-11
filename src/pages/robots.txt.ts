import type { APIRoute } from "astro";
import { portal } from "../lib/sites";

export const GET: APIRoute = () => {
  const sitemap = `${portal.canonicalOrigin.replace(/\/$/, "")}/sitemap-index.xml`;
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

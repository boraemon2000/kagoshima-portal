import raw from "../../data/sites.json";
import latestRaw from "../../data/latest.json";

export type SnsAccount = {
  platform: string;
  label: string;
  handle: string;
  url: string;
  note?: string;
};

export type Hub = {
  label: string;
  url: string;
  blurb: string;
};

export type Site = {
  id: string;
  name: string;
  short: string;
  url: string;
  host: string;
  role: string;
  kicker: string;
  description: string;
  long: string;
  howToRead: string[];
  whenToOpen: string[];
  colors: { primary: string; secondary: string };
  feed: { rest: string; rss: string };
  hubs: Hub[];
  sns: SnsAccount[];
  related: string[];
  relatedNote: string;
  business: { label: string; url: string }[];
  aboutUrl: string;
};

export type Guide = {
  id: string;
  title: string;
  lead: string;
  body: string;
  siteId: string;
  links: { label: string; url: string }[];
};

export type LatestPost = {
  siteId: string;
  title: string;
  url: string;
  date: string;
  excerpt: string;
  source: string;
};

export type LatestFile = {
  updatedAt: string | null;
  posts: LatestPost[];
  sites: Record<
    string,
    {
      ok: boolean;
      source: string | null;
      fetchedAt: string | null;
      error?: string;
      posts: LatestPost[];
    }
  >;
};

const data = raw as typeof raw & {
  portal: typeof raw.portal;
  sites: Site[];
  guides: Guide[];
};

export const portal = data.portal;
export const sites = data.sites as Site[];
export const snsPlatforms = data.snsPlatforms;
export const guides = data.guides as Guide[];
export const businessPaths = data.businessPaths;
export const faq = data.faq;
export const aboutSections = data.aboutSections;
export const latest = latestRaw as LatestFile;

export function siteById(id: string): Site {
  const found = sites.find((s) => s.id === id);
  if (!found) throw new Error(`unknown site: ${id}`);
  return found;
}

export function relatedSites(site: Site): Site[] {
  return site.related.map(siteById);
}

export function postsFor(siteId?: string, limit = 24): LatestPost[] {
  const list = siteId
    ? latest.posts.filter((p) => p.siteId === siteId)
    : latest.posts;
  return list.slice(0, limit);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

export function path(to: string): string {
  const base = import.meta.env.BASE_URL;
  const cleaned = to.replace(/^\/+/, "");
  if (!cleaned) return base;
  return `${base}${cleaned}${cleaned.endsWith("/") || cleaned.includes(".") ? "" : "/"}`;
}

export function asset(to: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleaned = to.startsWith("/") ? to : `/${to}`;
  return `${base}${cleaned}`;
}

export function absUrl(to: string): string {
  const origin = portal.canonicalOrigin.replace(/\/$/, "");
  const cleaned = to.replace(/^\/+/, "");
  if (!cleaned) return `${origin}/`;
  const suffix = cleaned.endsWith("/") || cleaned.includes(".") ? cleaned : `${cleaned}/`;
  return `${origin}/${suffix}`;
}

export const nav = [
  { href: "latest/", label: "新着" },
  { href: "sns/", label: "SNS" },
  { href: "guide/", label: "目的別" },
  { href: "for-business/", label: "事業者の方へ" },
];

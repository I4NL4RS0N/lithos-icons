// Fetches current headlines from public finance RSS feeds and prints them as JSON: [{ outlet, title, url }].
// The Scout reads these as signals only. Headlines are not stored in the repo or copied into the site.
// A feed that is down or blocks us is skipped; the Scout falls back to web search.
const FEEDS = [
  ['Bloomberg', 'https://feeds.bloomberg.com/markets/news.rss'],
  ['Financial Times', 'https://www.ft.com/markets?format=rss'],
  ['Financial Times', 'https://www.ft.com/global-economy?format=rss'],
  ['The Economist', 'https://www.economist.com/finance-and-economics/rss.xml'],
  ['Yahoo Finance', 'https://finance.yahoo.com/rss/topstories'],
  ['CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html'],
];
const PER_FEED = 20, MAX_AGE = 72 * 36e5;
const text = (x, tag) => { const m = x.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')); return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").trim() : ''; };
export function parse(xml, outlet) {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  return items.map((it) => ({ outlet, title: text(it, 'title').slice(0, 200), url: text(it, 'link'), at: Date.parse(text(it, 'pubDate')) || Date.now() }))
    .filter((h) => h.title && /^https:\/\//.test(h.url) && Date.now() - h.at < MAX_AGE).slice(0, PER_FEED).map(({ outlet, title, url }) => ({ outlet, title, url: url.split('?')[0] }));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = [];
  await Promise.all(FEEDS.map(async ([outlet, url]) => {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'LithosIconsBot/1.0 (+https://icons.lithos.design)', accept: 'application/rss+xml, application/xml, text/xml' }, signal: AbortSignal.timeout(15000) });
      if (r.ok) out.push(...parse(await r.text(), outlet));
    } catch { /* skip this feed */ }
  }));
  console.log(JSON.stringify(out));
}

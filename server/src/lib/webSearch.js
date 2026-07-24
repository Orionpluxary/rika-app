// Lightweight web search via DuckDuckGo HTML results.

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function webSearch(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Rika/2.0; +https://github.com/)",
    },
  });
  if (!res.ok) {
    return { results: [], error: `Search request failed (${res.status}).` };
  }
  const html = await res.text();

  const results = [];
  const blockRegex = /<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = blockRegex.exec(html)) !== null && results.length < 5) {
    const [, rawUrl, rawTitle, rawSnippet] = match;
    results.push({
      title: stripTags(rawTitle),
      url: decodeDuckDuckGoUrl(rawUrl),
      snippet: stripTags(rawSnippet),
    });
  }

  return { results };
}

function decodeDuckDuckGoUrl(href) {
  // DuckDuckGo's HTML results wrap the real URL in a redirect param.
  try {
    const u = new URL(href, "https://duckduckgo.com");
    const real = u.searchParams.get("uddg");
    return real ? decodeURIComponent(real) : href;
  } catch {
    return href;
  }
}

module.exports = { webSearch };

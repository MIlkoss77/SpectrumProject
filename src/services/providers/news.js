import { clamp } from "../indicators";
import { getFallbackNews } from "./fallbacks";

const CRYPTOCOMPARE_BASE = "https://min-api.cryptocompare.com/data/v2/news/";

function detectImpact(item) {
  const categories = (item.categories || "").split("|").map(x => x.trim().toLowerCase());
  if (categories.includes("regulation") || categories.includes("market")) return "high";
  if (categories.includes("defi") || categories.includes("analysis")) return "med";
  if (categories.includes("trading") || categories.includes("technology")) return "med";
  return "low";
}

function analyzeSentiment(body = "") {
  const text = body.toLowerCase();
  const positive = ["surge", "bull", "rally", "gain", "partnership", "growth", "expands"];
  const negative = ["hack", "drop", "sell-off", "lawsuit", "ban", "fraud", "bear"];
  let score = 0;
  for (const word of positive) if (text.includes(word)) score += 1;
  for (const word of negative) if (text.includes(word)) score -= 1;
  if (score > 1) return "bullish";
  if (score < -1) return "bearish";
  return score === 0 ? "neutral" : score > 0 ? "slightly_bullish" : "slightly_bearish";
}

function summarize(body = "", max = 220) {
  if (!body) return "";
  if (body.length <= max) return body;
  return body.slice(0, max).trimEnd() + "…";
}

export async function fetchNewsFeed({ lang = "en", limit = 30 } = {}) {
  try {
    const url = `${CRYPTOCOMPARE_BASE}?lang=${lang.toUpperCase()}&lTs=-1`; // -1 => latest
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`News request failed ${res.status}`);
    const json = await res.json();
    const items = (json.Data || []).slice(0, limit);
    if (!items.length) {
      return getFallbackNews({ lang, limit });
    }
    return items.map(item => {
      const impact = detectImpact(item);
      const sentiment = item.sentiment || analyzeSentiment(item.body || item.title);
      const rawScore = Number(item.overall_sentiment_score || 0);
      const confidence = clamp(Math.abs(rawScore) / 3, 0, 0.95);
      return {
        id: item.id,
        title: item.title,
        url: item.url,
        source: item.source,
        lang: item.lang?.toLowerCase?.() || lang,
        impact,
        sentiment,
        confidence,
        summary: summarize(item.body),
        publishedAt: item.published_on ? item.published_on * 1000 : Date.now(),
        related: item.categories?.split("|").filter(Boolean) || [],
      };
    });
  } catch (err) {
    console.warn("News fallback", err?.message || err);
    return getFallbackNews({ lang, limit });
  }
}
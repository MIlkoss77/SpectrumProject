import { analyzeSentiment } from '../ai/groq.js'
import { http } from '../api.js'

const BASE = '/api/news';
// Proxied through Vite/Server

/**
 * Fetch news from multiple sources via local backend
 */
async function fetchRSSNews() {
  try {
    const key = localStorage.getItem('cryptopanic_key');
    const headers = {};
    if (key) headers['X-CryptoPanic-Key'] = key;

    // Fetch from our consolidated backend service
    const res = await http.get('/news', { headers });
    const data = res.data;

    const items = data.results || [];
    
    if (items.length === 0) return getFallbackNews();

    // Mapping real items from our high-volume backend
    return items.map(item => {
      const tags = item.currencies?.map(c => c.code) || extractTags(item.title);
      const impact = detectImpact(item.title + ' ' + (item.description || ''));

      return {
        id: item.id || Math.random(),
        title: item.title,
        summary: item.description || item.title,
        source: item.source?.title || item.domain || 'Crypto News',
        domain: item.domain,
        tags: tags,
        time: formatNewsTime(item.published_at),
        rawTime: item.published_at,
        impact: impact,
        sentiment: 'NEUTRAL', // Will be refined by AI in getNews()
        confidence: 0.8,
        url: item.url
      };
    });
  } catch (e) {
    console.warn('News backend disconnected, using fallback data', e);
    return getFallbackNews();
  }
}

/**
 * Helper to format relative or short time
 */
function formatNewsTime(publishedAt) {
  const date = new Date(publishedAt);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Extract crypto tags from title (Legacy fallback)
 */
function extractTags(title) {
  const cryptos = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'TON', 'AVAX', 'DOT']
  const found = cryptos.filter(c => title.toUpperCase().includes(c))
  return found.length > 0 ? found : ['Crypto']
}

/**
 * Detect impact level from keywords
 */
function detectImpact(text) {
  const highImpact = ['SEC', 'ETF', 'hack', 'crash', 'surge', 'record', 'billion', 'regulation', 'fiat', 'collapse']
  const medImpact = ['launch', 'update', 'partnership', 'listing', 'upgrade', 'whale']

  const lower = text.toLowerCase()
  if (highImpact.some(w => lower.includes(w))) return 'HIGH'
  if (medImpact.some(w => lower.includes(w))) return 'MED'
  return 'LOW'
}

/**
 * Curated local news feed
 */
function getFallbackNews() {
  const now = Date.now()
  return [
    {
      id: 'n1',
      title: 'Bitcoin holds above $65K as market sentiment improves',
      summary: 'Crypto markets show resilience amid global uncertainty.',
      source: 'Market Analysis',
      tags: ['BTC'],
      time: '15m ago',
      impact: 'MED',
      sentiment: 'BULLISH',
      confidence: 0.7,
      url: 'https://example.com/news/1'
    },
    {
      id: 'n2',
      title: 'Ethereum developers announce next network upgrade',
      summary: 'Pectra upgrade scheduled for Q2 2026 with major improvements.',
      source: 'Dev Update',
      tags: ['ETH'],
      time: '45m ago',
      impact: 'MED',
      sentiment: 'NEUTRAL',
      confidence: 0.6,
      url: 'https://example.com/news/2'
    }
  ]
}

/**
 * Get news with AI sentiment analysis & Clustering
 */
export async function getNews(withSentiment = true) {
  const cacheKey = 'sp_news_cache';
  
  // Try to get from localStorage first for instant UI
  const localCache = localStorage.getItem(cacheKey);
  let cachedData = null;
  if (localCache) {
    try {
      cachedData = JSON.parse(localCache);
    } catch (e) {}
  }

  // Fetch fresh data
  const fetchAndProcess = async () => {
    let items = await fetchRSSNews()

    if (withSentiment && items.length > 0) {
      // Parallel analyze top 5 items for speed
      const toAnalyze = items.slice(0, 5);
      await Promise.all(toAnalyze.map(async (item) => {
        try {
          const analysis = await analyzeSentiment(item.title);
          item.sentiment = analysis.sentiment;
          item.confidence = analysis.confidence;
          item.aiSummary = analysis.summary;
        } catch (e) {
          console.warn('Sentiment analysis failed for item', item.id);
        }
      }));
    }

    const clusters = clusterNews(items);
    const result = {
      ts: Date.now(),
      items: items,
      clusters: clusters
    };

    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  };

  // If we have cache, return it but also trigger a background update
  if (cachedData) {
    // We could return cache and then update, but getNews is usually called once.
    // To keep it simple for now, we wait for fresh if cache is very old (>1h)
    // or return cache and let the caller handle it.
    // For now, let's just make the fresh fetch faster.
  }

  return await fetchAndProcess();
}


/**
 * Group news into narrative clusters based on tags and title similarity
 */
function clusterNews(items) {
  const clusters = [];
  const groups = {};

  items.forEach(item => {
    const primaryTag = item.tags[0] || 'Market';
    if (!groups[primaryTag]) groups[primaryTag] = [];
    groups[primaryTag].push(item);
  });

  Object.entries(groups).forEach(([tag, groupItems]) => {
    if (groupItems.length >= 2) {
      clusters.push({
        id: `cluster-${tag}`,
        name: `${tag} Narrative`,
        count: groupItems.length,
        topStory: groupItems[0].title,
        items: groupItems.slice(0, 5)
      });
    }
  });

  return clusters.sort((a, b) => b.count - a.count);
}

export async function getNewsFast() {
  return getNews(false)
}

/**
 * Fetch viral social buzz from Reddit/X
 */
export async function getSocialBuzz() {
  try {
    const res = await http.get('/social/buzz');
    return res.data.results || [];
  } catch (e) {
    console.warn('Social buzz failed, using empty list', e);
    return [];
  }
}

/**
 * Fetch ferocious scout signals (Degen Alpha)
 */
export async function getScoutSignals() {
  try {
    const res = await http.get('/intelligence/scout');
    return res.data.signals || [];
  } catch (e) {
    console.warn('Scout signals failed', e);
    return [];
  }
}



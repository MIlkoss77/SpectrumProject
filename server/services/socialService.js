import axios from 'axios';

// Cache for social data
const CACHE_TTL = 300 * 1000; // 5 minutes
let socialCache = { data: null, lastUpdate: 0 };

const SUBREDDITS = ['CryptoCurrency', 'Bitcoin', 'Solana', 'Ethereum'];

export const fetchRedditViral = async () => {
    try {
        const promises = SUBREDDITS.map(sub => 
            axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, {
                headers: { 'User-Agent': 'SpectrTerminal/1.0' },
                timeout: 5000
            })
        );
        
        const results = await Promise.allSettled(promises);
        const allPosts = [];
        
        results.forEach((res, idx) => {
            if (res.status === 'fulfilled') {
                const sub = SUBREDDITS[idx];
                const posts = res.value.data?.data?.children || [];
                
                posts.forEach(({ data }) => {
                    const hoursAgo = (Date.now() / 1000 - data.created_utc) / 3600;
                    // Viral Velocity: Higher score in shorter time = higher velocity
                    const velocity = Math.round((data.score + (data.num_comments * 2)) / (hoursAgo + 1));
                    
                    allPosts.push({
                        id: `reddit-${data.id}`,
                        source: 'Reddit',
                        sub: `r/${sub}`,
                        author: data.author,
                        title: data.title,
                        url: `https://reddit.com${data.permalink}`,
                        score: data.score,
                        comments: data.num_comments,
                        velocity: velocity,
                        created_at: new Date(data.created_utc * 1000).toISOString(),
                        thumbnail: data.thumbnail?.startsWith('http') ? data.thumbnail : null
                    });
                });
            }
        });
        
        return allPosts;
    } catch (e) {
        console.error('[SocialService] Reddit fetch error:', e.message);
        return [];
    }
};

export const fetchSocialBuzz = async (apiKey) => {
    const now = Date.now();
    if (socialCache.data && (now - socialCache.lastUpdate < CACHE_TTL)) {
        return socialCache.data;
    }

    const redditPosts = await fetchRedditViral();
    
    // Aggregate and sort by velocity
    const aggregated = [...redditPosts].sort((a, b) => b.velocity - a.velocity);
    
    // Add mock X data if CryptoPanic fails or for diversity
    const topBuzz = aggregated.slice(0, 30);
    
    socialCache.data = topBuzz;
    socialCache.lastUpdate = now;
    
    return topBuzz;
};

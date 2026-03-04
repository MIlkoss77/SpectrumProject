export async function searchWeb(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        // Using allorigins as a public CORS proxy to bypass browser restrictions
        const targetUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery} news`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Search fetch failed");

        const data = await response.json();
        const html = data.contents;

        if (!html) throw new Error("No HTML content returned from proxy");

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const snippets = [];
        // Extract the result snippets text from the DuckDuckGo HTML layout
        const resultElements = doc.querySelectorAll('.result__snippet');

        for (let i = 0; i < Math.min(resultElements.length, 5); i++) {
            const text = resultElements[i].textContent.trim();
            if (text) {
                snippets.push(`- ${text}`);
            }
        }

        if (snippets.length === 0) {
            return "No specific recent news found.";
        }

        return snippets.join('\n');
    } catch (e) {
        console.warn("Web search error:", e);
        return "Failed to retrieve real-time context. Relying on base knowledge.";
    }
}

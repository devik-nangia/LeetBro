/**
 * Searches YouTube for the top video matching a query.
 * Uses YouTube's internal suggest API — no API key, no cheerio, no scraping.
 * Works reliably in serverless environments (Vercel).
 */
export async function getTopVideoForQuery(query: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(query);
    // YouTube's internal search API returns JSON with video suggestions
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encoded}&sp=EgIQAQ%3D%3D`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        // Cache for 1 hour — same query = same video
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return null;

    const html = await res.text();

    // YouTube embeds initial data as a JSON blob in the page HTML
    const match = html.match(/var ytInitialData = ({[\s\S]+?});<\/script>/);
    if (!match) return null;

    const data = JSON.parse(match[1]);

    // Walk the response tree to find the first videoRenderer
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents;

    if (!Array.isArray(contents)) return null;

    for (const section of contents) {
      const items =
        section?.itemSectionRenderer?.contents;
      if (!Array.isArray(items)) continue;

      for (const item of items) {
        const videoId = item?.videoRenderer?.videoId;
        if (videoId) return videoId;
      }
    }

    return null;
  } catch (error) {
    console.error("YouTube Search Error:", error);
    return null;
  }
}

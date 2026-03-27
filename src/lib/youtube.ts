import ytSearch from "yt-search";

export async function getTopVideoForQuery(query: string): Promise<string | null> {
  try {
    const r = await ytSearch(query);
    const videos = r.videos;
    if (videos && videos.length > 0) {
      return videos[0].videoId;
    }
    return null;
  } catch (error) {
    console.error("YouTube Search Error:", error);
    return null;
  }
}

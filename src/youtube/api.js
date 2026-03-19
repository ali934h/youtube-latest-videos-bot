// YouTube Data API v3 integration
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Resolves a YouTube @handle to a channel ID
async function resolveChannelId(handle, apiKey) {
  const url = `${BASE_URL}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error(`Channel "@${handle}" not found. Please check the handle and try again.`);
  }

  return data.items[0].id;
}

// Fetches the latest N videos (including live & upcoming) from a channel
export async function getLatestVideos(handle, count, apiKey) {
  const channelId = await resolveChannelId(handle, apiKey);

  const url =
    `${BASE_URL}/search?part=snippet` +
    `&channelId=${channelId}` +
    `&order=date` +
    `&maxResults=${count}` +
    `&type=video` +
    `&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'YouTube API error.');
  }

  if (!data.items) throw new Error('Failed to fetch videos from YouTube.');

  // Slice to exact count in case API returns more
  return data.items.slice(0, count).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    liveBroadcastContent: item.snippet.liveBroadcastContent,
    publishedAt: item.snippet.publishedAt,
  }));
}

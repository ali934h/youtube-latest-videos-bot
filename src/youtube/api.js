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

// Parses ISO 8601 duration (PT1H2M3S) to total seconds
function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  return h * 3600 + m * 60 + s;
}

// Formats seconds to human-readable duration
function formatDuration(seconds) {
  if (seconds === 0) return 'Live';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Determines video type based on duration and liveBroadcastContent
function getVideoType(liveBroadcastContent, durationSeconds) {
  if (liveBroadcastContent === 'live') return 'live';
  if (liveBroadcastContent === 'upcoming') return 'upcoming';
  if (durationSeconds > 0 && durationSeconds <= 60) return 'short';
  return 'video';
}

// Converts UTC date string to Iran time (UTC+3:30)
function toIranTime(utcString) {
  const date = new Date(utcString);
  const iranOffset = 3.5 * 60 * 60 * 1000;
  const iranDate = new Date(date.getTime() + iranOffset);
  const yyyy = iranDate.getUTCFullYear();
  const mm = String(iranDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(iranDate.getUTCDate()).padStart(2, '0');
  const hh = String(iranDate.getUTCHours()).padStart(2, '0');
  const min = String(iranDate.getUTCMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

// Fetches the latest N videos (including live & upcoming) from a channel
export async function getLatestVideos(handle, count, apiKey) {
  const channelId = await resolveChannelId(handle, apiKey);

  const searchUrl =
    `${BASE_URL}/search?part=snippet` +
    `&channelId=${channelId}` +
    `&order=date` +
    `&maxResults=${count}` +
    `&type=video` +
    `&key=${apiKey}`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (searchData.error) throw new Error(searchData.error.message || 'YouTube API error.');
  if (!searchData.items) throw new Error('Failed to fetch videos from YouTube.');

  const items = searchData.items.slice(0, count);
  const videoIds = items.map((i) => i.id.videoId).join(',');

  // Fetch duration and content details
  const detailsUrl =
    `${BASE_URL}/videos?part=contentDetails` +
    `&id=${videoIds}` +
    `&key=${apiKey}`;

  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  const detailsMap = {};
  if (detailsData.items) {
    for (const item of detailsData.items) {
      detailsMap[item.id] = item.contentDetails;
    }
  }

  return items.map((item) => {
    const videoId = item.id.videoId;
    const details = detailsMap[videoId];
    const durationSeconds = details ? parseDuration(details.duration) : 0;
    const liveBroadcastContent = item.snippet.liveBroadcastContent;
    const type = getVideoType(liveBroadcastContent, durationSeconds);

    return {
      id: videoId,
      title: item.snippet.title,
      type,
      duration: formatDuration(durationSeconds),
      durationSeconds,
      publishedAt: toIranTime(item.snippet.publishedAt),
    };
  });
}

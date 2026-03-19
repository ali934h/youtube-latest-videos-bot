// Formats the list of videos into a Telegram HTML message
const TYPE_EMOJI = {
  live: '🔴',
  upcoming: '🔔',
  stream: '📡',
  video: '🎬',
};

const TYPE_LABEL = {
  live: 'Live',
  upcoming: 'Upcoming',
  stream: 'Stream',
  video: 'Video',
};

export function formatVideoList(videos, handle) {
  const header = `📺 <b>Latest ${videos.length} videos from @${escapeHtml(handle)}</b>\n`;
  const divider = '─────────────────\n';

  const lines = videos.map((video, i) => {
    const emoji = TYPE_EMOJI[video.type] ?? '🎬';
    const label = TYPE_LABEL[video.type] ?? 'Video';
    const duration = video.type === 'live' ? '' : ` | ${escapeHtml(video.duration)}`;
    const date = escapeHtml(video.publishedAt);
    const title = escapeHtml(video.title);

    return (
      `${i + 1}. ${emoji} <a href="https://youtu.be/${video.id}">${title}</a>\n` +
      `   🏷 <b>${label}</b>${duration}\n` +
      `   📅 ${date}`
    );
  });

  return header + divider + lines.join('\n\n');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

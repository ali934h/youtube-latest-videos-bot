// Formats the list of videos into a Telegram MarkdownV2 message
const TYPE_EMOJI = {
  live: '🔴',
  upcoming: '🔔',
  short: '🯆',
  video: '🎬',
};

const TYPE_LABEL = {
  live: 'LIVE',
  upcoming: 'Upcoming',
  short: 'Short',
  video: 'Video',
};

export function formatVideoList(videos, handle) {
  const header = `📺 *Latest ${videos.length} videos from @${escapeMarkdownV2(handle)}*\n`;
  const divider = '─────────────────\n';

  const lines = videos.map((video, i) => {
    const emoji = TYPE_EMOJI[video.type] ?? '🎬';
    const label = TYPE_LABEL[video.type] ?? 'Video';
    const title = escapeMarkdownV2(video.title);
    const duration = video.type === 'live' ? '' : ` \| ${escapeMarkdownV2(video.duration)}`;
    const date = escapeMarkdownV2(video.publishedAt);

    return (
      `${i + 1}\. ${emoji} [${title}](https://youtu\.be/${video.id})\n` +
      `   🏷 ${label}${duration}\n` +
      `   📅 ${date}`
    );
  });

  return header + divider + lines.join('\n\n');
}

function escapeMarkdownV2(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

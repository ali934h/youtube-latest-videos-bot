// Formats the list of videos into a Telegram MarkdownV2 message
const TYPE_EMOJI = {
  live: '🔴',
  upcoming: '🔔',
  none: '🎬',
};

export function formatVideoList(videos, handle) {
  const header = `📺 *Latest ${videos.length} videos from @${escapeMarkdownV2(handle)}*\n`;
  const divider = '─────────────────\n';

  const lines = videos.map((video, i) => {
    const emoji = TYPE_EMOJI[video.liveBroadcastContent] ?? '🎬';
    const label =
      video.liveBroadcastContent === 'live'
        ? ' _\(LIVE NOW\)_'
        : video.liveBroadcastContent === 'upcoming'
        ? ' _\(Upcoming\)_'
        : '';
    const title = escapeMarkdownV2(video.title);
    return `${i + 1}\. ${emoji} [${title}](https://youtu\.be/${video.id})${label}`;
  });

  return header + divider + lines.join('\n');
}

function escapeMarkdownV2(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

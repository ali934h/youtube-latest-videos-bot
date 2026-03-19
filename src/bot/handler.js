// Handles incoming Telegram webhook updates
import { sendMessage } from './telegram.js';
import { isUserAllowed } from '../utils/auth.js';
import { parseInput } from '../utils/parser.js';
import { getLatestVideos } from '../youtube/api.js';
import { formatVideoList } from '../utils/formatter.js';

export async function handleWebhook(request, env) {
  let update;
  try {
    update = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const message = update?.message;
  if (!message || !message.text) return new Response('OK', { status: 200 });

  const chatId = message.chat.id;
  const userId = message.from?.id;
  // Normalize command: strip bot username suffix (e.g. /start@mybot -> /start)
  const text = message.text.trim().replace(/(@\S+)/, '').trim();

  // Access control
  if (!isUserAllowed(userId, env.ALLOWED_USER_IDS)) {
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, '⛔ You are not authorized to use this bot.');
    return new Response('OK', { status: 200 });
  }

  // Handle /start command
  if (text === '/start') {
    const welcome =
      `👋 *Welcome to YouTube Latest Videos Bot\!*\n\n` +
      `Send me a YouTube channel handle and how many recent videos you want\.\n\n` +
      `*Format:*\n` +
      `\`@ChannelHandle 5\`\n` +
      `\`https://www\.youtube\.com/@Channel 10\`\n\n` +
      `_Supports videos, live streams, and premieres\._`;
    const result = await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, welcome, 'MarkdownV2');
    if (!result.ok) {
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, 'Welcome to YouTube Latest Videos Bot!\n\nSend: @ChannelHandle 5');
    }
    return new Response('OK', { status: 200 });
  }

  // Handle /help command
  if (text === '/help') {
    const help =
      `📖 *How to use:*\n\n` +
      `Send a channel handle \+ number of videos:\n` +
      `\`@ChannelHandle 5\`\n\n` +
      `Or with full URL:\n` +
      `\`https://www\.youtube\.com/@Channel 10\`\n\n` +
      `*Max videos per request:* 50`;
    const result = await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, help, 'MarkdownV2');
    if (!result.ok) {
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, 'Send: @ChannelHandle 5 (max 50 videos)');
    }
    return new Response('OK', { status: 200 });
  }

  // Parse input
  const parsed = parseInput(text);
  if (!parsed) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      '❓ Invalid format.\n\nPlease send in this format:\n@ChannelHandle 5'
    );
    return new Response('OK', { status: 200 });
  }

  const { handle, count } = parsed;

  // Loading indicator
  await sendMessage(
    env.TELEGRAM_BOT_TOKEN,
    chatId,
    `🔍 Fetching the latest ${count} videos from @${handle}...`
  );

  try {
    const videos = await getLatestVideos(handle, count, env.YOUTUBE_API_KEY);

    if (!videos || videos.length === 0) {
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, '😕 No videos found for this channel.');
      return new Response('OK', { status: 200 });
    }

    const reply = formatVideoList(videos, handle);
    const result = await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, reply, 'MarkdownV2');
    if (!result.ok) {
      // Fallback: send plain text if MarkdownV2 fails
      const plain = videos.map((v, i) => `${i + 1}. ${v.title}\nhttps://youtu.be/${v.id}`).join('\n\n');
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, `Latest ${videos.length} videos from @${handle}:\n\n${plain}`);
    }
  } catch (err) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `⚠️ Error: ${err.message}`
    );
  }

  return new Response('OK', { status: 200 });
}

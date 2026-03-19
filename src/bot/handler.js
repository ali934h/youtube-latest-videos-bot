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
  const rawText = message.text.trim();

  // Normalize commands only: strip bot username suffix (e.g. /start@mybot -> /start)
  const text = rawText.startsWith('/')
    ? rawText.replace(/\/([a-zA-Z0-9_]+)(@\S+)?/, '/$1').trim()
    : rawText;

  // Access control
  if (!isUserAllowed(userId, env.ALLOWED_USER_IDS)) {
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, '⛔ You are not authorized to use this bot.');
    return new Response('OK', { status: 200 });
  }

  // Handle /start command
  if (text === '/start') {
    const welcome =
      `👋 <b>Welcome to YouTube Latest Videos Bot!</b>\n\n` +
      `Send me a YouTube channel handle and how many recent videos you want.\n\n` +
      `<b>Format:</b>\n` +
      `<code>@ChannelHandle 5</code>\n` +
      `<code>https://www.youtube.com/@Channel 10</code>\n\n` +
      `<i>Supports videos, live streams, shorts and premieres.</i>`;
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, welcome, 'HTML');
    return new Response('OK', { status: 200 });
  }

  // Handle /help command
  if (text === '/help') {
    const help =
      `📖 <b>How to use:</b>\n\n` +
      `Send a channel handle + number of videos:\n` +
      `<code>@ChannelHandle 5</code>\n\n` +
      `Or with full URL:\n` +
      `<code>https://www.youtube.com/@Channel 10</code>\n\n` +
      `<b>Max videos per request:</b> 50`;
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, help, 'HTML');
    return new Response('OK', { status: 200 });
  }

  // Parse input
  const parsed = parseInput(text);
  if (!parsed) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      '❓ <b>Invalid format.</b>\n\nPlease send in this format:\n<code>@ChannelHandle 5</code>',
      'HTML'
    );
    return new Response('OK', { status: 200 });
  }

  const { handle, count } = parsed;

  await sendMessage(
    env.TELEGRAM_BOT_TOKEN,
    chatId,
    `🔍 Fetching the latest <b>${count}</b> videos from <b>@${handle}</b>...`,
    'HTML'
  );

  try {
    const videos = await getLatestVideos(handle, count, env.YOUTUBE_API_KEY);

    if (!videos || videos.length === 0) {
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, '😕 No videos found for this channel.');
      return new Response('OK', { status: 200 });
    }

    const reply = formatVideoList(videos, handle);
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, reply, 'HTML');
  } catch (err) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `⚠️ Error: ${err.message}`
    );
  }

  return new Response('OK', { status: 200 });
}

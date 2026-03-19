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

  // Normalize commands: strip bot username suffix (e.g. /start@mybot -> /start)
  const text = rawText.startsWith('/')
    ? rawText.replace(/\/([a-zA-Z0-9_]+)(@\S+)?/, '/$1').trim()
    : rawText;

  // Access control
  if (!isUserAllowed(userId, env.ALLOWED_USER_IDS)) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      '⛔ <b>Access Denied</b>\n\nYou are not authorized to use this bot.',
      'HTML'
    );
    return new Response('OK', { status: 200 });
  }

  // /start
  if (text === '/start') {
    const welcome =
      `👋 <b>Welcome to YouTube Latest Videos Bot!</b>\n\n` +
      `Send me a YouTube channel handle and a number to get the latest videos.\n\n` +
      `<b>Format:</b>\n` +
      `<code>@ChannelHandle 5</code>\n\n` +
      `Use /help for full instructions or /examples to see sample queries.`;
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, welcome, 'HTML');
    return new Response('OK', { status: 200 });
  }

  // /help
  if (text === '/help') {
    const help =
      `📖 <b>How to use:</b>\n\n` +
      `Send a channel handle + number of videos you want:\n` +
      `<code>@ChannelHandle 5</code>\n\n` +
      `Or paste the full YouTube channel URL:\n` +
      `<code>https://www.youtube.com/@Channel 10</code>\n\n` +
      `<b>Video types:</b>\n` +
      `🎬 Video — regular uploaded video\n` +
      `📡 Stream — archived live stream\n` +
      `🔴 Live — currently broadcasting\n` +
      `🔔 Upcoming — scheduled stream\n\n` +
      `<b>Limits:</b> 1 to 50 videos per request\n\n` +
      `Use /examples to see ready-to-use queries.`;
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, help, 'HTML');
    return new Response('OK', { status: 200 });
  }

  // /examples
  if (text === '/examples') {
    const examples =
      `💡 <b>Example queries:</b>\n\n` +
      `<code>@MrBeast 5</code>\n` +
      `<code>@veritasium 10</code>\n` +
      `<code>@Capitol_Report 3</code>\n` +
      `<code>https://www.youtube.com/@NASA 7</code>\n\n` +
      `Just copy one, change the channel and number, and send!`;
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, examples, 'HTML');
    return new Response('OK', { status: 200 });
  }

  // Parse input
  const parsed = parseInput(text);
  if (!parsed) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      '❓ <b>Invalid format.</b>\n\nPlease send in this format:\n<code>@ChannelHandle 5</code>\n\nUse /help for more info.',
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
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, '😕 No videos found for this channel. Please check the handle and try again.');
      return new Response('OK', { status: 200 });
    }

    const reply = formatVideoList(videos, handle);
    await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, reply, 'HTML');
  } catch (err) {
    await sendMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `⚠️ <b>Error:</b> ${err.message}`,
      'HTML'
    );
  }

  return new Response('OK', { status: 200 });
}

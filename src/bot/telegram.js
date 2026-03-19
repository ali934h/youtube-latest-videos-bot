// Telegram Bot API helper
export async function sendMessage(token, chatId, text, parseMode = null) {
  const body = {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  };
  if (parseMode) body.parse_mode = parseMode;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.json();
}

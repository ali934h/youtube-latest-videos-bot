// Entry point — routes incoming requests
import { handleWebhook } from './bot/handler.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/webhook') {
      return handleWebhook(request, env);
    }

    return new Response('YouTube Latest Videos Bot is running.', { status: 200 });
  },
};

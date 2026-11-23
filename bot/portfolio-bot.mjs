import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function settings(env = process.env) {
  const token = env.PORTFOLIO_BOT_TOKEN?.trim();
  let url;
  try {
    url = new URL(env.PORTFOLIO_WEB_APP_URL);
  } catch {
    throw Error('Configure PORTFOLIO_WEB_APP_URL.');
  }
  if (!token || url.protocol !== 'https:' || url.username || url.password)
    throw Error('Configure the bot token and HTTPS app URL.');
  return { token, url: url.href };
}
export function telegramApi(token, fetchImpl = fetch) {
  return async (method, body = {}, signal) => {
    let response, data;
    try {
      response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: signal || AbortSignal.timeout(15000),
      });
      data = await response.json();
    } catch {
      throw Error('Telegram connection failed.');
    }
    if (!response.ok || data.ok !== true)
      throw Error(`Telegram API rejected request (${Number(data.error_code) || response.status}).`);
    return data.result;
  };
}
export async function handleMessage(api, message, url) {
  if (!message?.chat || typeof message.text !== 'string') return;
  const command = message.text.trim().split(/\s+/)[0].split('@')[0].toLowerCase();
  if (!['/start', '/app', '/help'].includes(command)) return;
  if (message.chat.type !== 'private') {
    await api('sendMessage', {
      chat_id: message.chat.id,
      text: 'Откройте личную переписку с @alchemist_flamel_bot, чтобы запустить портфолио.',
    });
    return;
  }
  await api('sendMessage', {
    chat_id: message.chat.id,
    text: 'Привет! Это портфолио Bilderberg.\n\nВнутри — проекты, карты навыков, плавные часы и перемещаемые виджеты. Откройте приложение и попробуйте сами.',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть приложение', web_app: { url } }],
        [{ text: 'Сайт-портфолио ↗', url: 'https://bilderberg-labs.ru/' }],
      ],
    },
  });
}
export async function main() {
  const config = settings();
  const api = telegramApi(config.token);
  const me = await api('getMe');
  if (me.username !== 'alchemist_flamel_bot')
    throw Error('Configured token belongs to a different bot.');
  const webhook = await api('getWebhookInfo');
  if (webhook.url)
    throw Error('An existing webhook is configured. Review it before starting polling.');
  await api('setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Открыть приложение', web_app: { url: config.url } },
  });
  await api('setMyCommands', {
    commands: [
      { command: 'start', description: 'Знакомство и запуск портфолио' },
      { command: 'app', description: 'Открыть приложение' },
      { command: 'help', description: 'Как посмотреть проекты' },
    ],
  });
  console.log('Portfolio bot started: @alchemist_flamel_bot.');
  let stopping = false,
    offset = 0,
    controller;
  const stop = () => {
    stopping = true;
    controller?.abort();
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  try {
    while (!stopping) {
      try {
        controller = new AbortController();
        const updates = await api(
          'getUpdates',
          { offset, timeout: 25, allowed_updates: ['message'] },
          AbortSignal.any([controller.signal, AbortSignal.timeout(40000)]),
        );
        for (const update of updates) {
          if (stopping) break;
          await handleMessage(api, update.message, config.url);
          offset = update.update_id + 1;
        }
      } catch (error) {
        if (stopping) break;

        console.error(error.message);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  } finally {
    process.removeListener('SIGTERM', stop);
    process.removeListener('SIGINT', stop);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });

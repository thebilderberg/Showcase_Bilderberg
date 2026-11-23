import test from 'node:test';
import assert from 'node:assert/strict';
import { settings, telegramApi, handleMessage } from './portfolio-bot.mjs';
const url = 'https://bilderberg-labs.ru/#app';
test('settings require token and HTTPS', () => {
  assert.throws(() => settings({ PORTFOLIO_BOT_TOKEN: '', PORTFOLIO_WEB_APP_URL: url }));
  assert.throws(() =>
    settings({ PORTFOLIO_BOT_TOKEN: 'fake', PORTFOLIO_WEB_APP_URL: 'http://example.com' }),
  );
  assert.equal(settings({ PORTFOLIO_BOT_TOKEN: 'fake', PORTFOLIO_WEB_APP_URL: url }).url, url);
});
test('start deep link and app command send correct Web App buttons', async () => {
  const calls = [];
  const api = async (method, body) => {
    calls.push({ method, body });
  };
  for (const text of ['/start portfolio', '/app@alchemist_flamel_bot'])
    await handleMessage(api, { text, chat: { type: 'private', id: 42 } }, url);
  assert.equal(calls.length, 2);
  for (const { method, body } of calls) {
    assert.equal(method, 'sendMessage');
    assert.equal(body.chat_id, 42);
    assert.equal(body.reply_markup.inline_keyboard[0][0].web_app.url, url);
    assert.match(body.text, /Bilderberg/);
  }
  await handleMessage(api, { text: 'hello', chat: { type: 'private', id: 42 } }, url);
  assert.equal(calls.length, 2);
  await handleMessage(api, { text: '/start', chat: { type: 'group', id: -42 } }, url);
  assert.equal(calls.at(-1).body.reply_markup, undefined);
});
test('API never exposes token in connection or rejection errors', async () => {
  const api = telegramApi('SECRET', async () => {
    throw Error('https://api.telegram.org/botSECRET/getMe');
  });
  await assert.rejects(api('getMe'), (error) => !error.message.includes('SECRET'));
  const reject = telegramApi('SECRET', async () => ({
    ok: false,
    status: 401,
    json: async () => ({ ok: false, error_code: 401, description: 'SECRET' }),
  }));
  await assert.rejects(reject('getMe'), /401/);
});

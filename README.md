# Bilderberg App

Моё портфолио в Telegram: карты Таро, проекты, виджеты и обо мне.
React, TypeScript, Canvas и SVG. Бот — на Node.js.

## Развернутый проект можно посмотреть через бота в телеграме:
[@alchemist_flamel_bot](@alchemist_flamel_bot)

## Запуск

Node.js 24+.

```sh
npm ci
cp .env.example .env
PORT=3002 npm start
```

Адрес — `localhost:3002`. Работает и в браузере, и внутри Telegram.
`REACT_APP_SITE_URL` в `.env` — ссылка на основной сайт.

## Бот

```sh
cp bot/.env.example bot/.env
chmod 600 bot/.env
npm run start:bot
```

Перед запуском заполнить токен и HTTPS-адрес приложения в `bot/.env`.
Бот проверяет имя `alchemist_flamel_bot` — для другого бота его нужно заменить в `bot/portfolio-bot.mjs`.
Две polling-копии одновременно не запускать.

## Код и проверка

- `src/app` — экраны, навигация и шесть виджетов.
- `src/shared` — проекты, настройки, общие стили и работа с Telegram.
- `bot` — бот и его тесты.

```sh
CI=true npm test -- --watchAll=false --runInBand
npm run test:bot
npm run check:secrets
npm run build
```

Для интерфейса публикуется только `build/`. Бот запускается отдельно.
Токен не класть в `REACT_APP_*` — эти значения попадут в браузер.

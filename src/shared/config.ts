export const portfolio = {
  name: process.env.REACT_APP_PORTFOLIO_NAME || 'Bilderberg',
  botUsername: (process.env.REACT_APP_BOT_USERNAME || 'alchemist_flamel_bot').replace(/^@/, ''),
  contactUsername: (process.env.REACT_APP_CONTACT_USERNAME || '').replace(/^@/, ''),
};
export const botUrl = /^[a-zA-Z0-9_]{5,32}$/.test(portfolio.botUsername)
  ? `https://t.me/${portfolio.botUsername}?start=portfolio`
  : null;
export const contactUrl = /^[a-zA-Z0-9_]{5,32}$/.test(portfolio.contactUsername)
  ? `https://t.me/${portfolio.contactUsername}`
  : null;
const projectUrl = (value: string | undefined) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
export const projects = [
  {
    id: 'perspectiva',
    number: '01',
    title: 'Perspectiva',
    category: 'Сайт автосервиса',
    image: '/projects/perspectiva.webp',
    theme: 'automotive',
    description:
      'От первого впечатления до заявки на ремонт. Тёмный интерфейс, видео реставрации под управлением прокрутки и форма с уведомлением в Telegram.',
    tags: ['JavaScript', 'Node.js', 'Telegram API'],
    details: [
      'Прокрутка управляет этапами реставрации автомобиля.',
      'Карточки услуг, фотографии до и после, адрес и карта.',
      'Заявки с сайта поступают в Telegram-группу сотрудников.',
    ],
    url: projectUrl(process.env.REACT_APP_PERSPECTIVA_URL || 'https://perspectiva-service.ru/'),
  },
  {
    id: 'ceremony',
    number: '02',
    title: 'Евгений и Виктория',
    category: 'Свадебное приглашение',
    image: '/projects/ceremony.webp',
    theme: 'wedding',
    description:
      'Личное приглашение, которое помогает собрать гостей: история, программа, карта места встречи и анкета с сохранением ответов.',
    tags: ['HTML / CSS', 'Node.js', 'SQLite'],
    details: [
      'Адаптивное приглашение с обратным отсчётом и картой.',
      'Анкета гостя с выбором блюд, напитков и пожеланиями.',
      'Ответы сохраняются в SQLite; предусмотрены административный просмотр и выгрузка.',
    ],
    url: projectUrl(process.env.REACT_APP_CEREMONY_URL || 'https://victoria-evgeniy.ru/'),
  },
];

const publicUrl = (value: string | undefined, fallback: string) => {
  try {
    const url = new URL(value || fallback);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : fallback;
  } catch {
    return fallback;
  }
};
export const miniAppUrl = publicUrl(
  process.env.REACT_APP_MINI_APP_URL,
  'https://bilderberg-labs.ru/#app',
);
export const siteUrl = publicUrl(process.env.REACT_APP_SITE_URL, 'https://bilderberg-labs.ru/');

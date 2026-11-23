export const timezones = [
  ['local', 'Местное время'],
  ['Europe/Kaliningrad', 'Калининград'],
  ['Europe/Moscow', 'Москва'],
  ['Europe/Samara', 'Самара'],
  ['Asia/Yekaterinburg', 'Екатеринбург'],
  ['Asia/Omsk', 'Омск'],
  ['Asia/Novosibirsk', 'Новосибирск'],
  ['Asia/Krasnoyarsk', 'Красноярск'],
  ['Asia/Irkutsk', 'Иркутск'],
  ['Asia/Yakutsk', 'Якутск'],
  ['Asia/Vladivostok', 'Владивосток'],
  ['Asia/Magadan', 'Магадан'],
  ['Asia/Kamchatka', 'Камчатка'],
  ['America/New_York', 'Нью-Йорк'],
  ['Asia/Tokyo', 'Токио'],
  ['Asia/Shanghai', 'Пекин'],
] as const;
export type ClockMode = 'classic' | 'dayNight' | 'AmPm';
const cache = new Map<string, Intl.DateTimeFormat>();
export function zonedTime(date: Date, zone: string) {
  const resolvedZone = zone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : zone;
  let formatter = cache.get(resolvedZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: resolvedZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    cache.set(resolvedZone, formatter);
  }
  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0);
  return {
    hours: get('hour'),
    minutes: get('minute'),
    seconds: get('second'),
    milliseconds: date.getMilliseconds(),
  };
}
export const meridiem = (hours: number) => (hours < 12 ? 'AM' : 'PM');

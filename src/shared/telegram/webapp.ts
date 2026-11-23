import { useEffect } from 'react';
import type { RouteKey } from '../../app/navigation/types';

type TelegramWebApp = {
  initData: string;
  ready: () => void;
  expand: () => void;
  isVersionAtLeast?: (version: string) => boolean;
  disableVerticalSwipes?: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (handler: () => void) => void;
    offClick: (handler: () => void) => void;
  };
};
declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}
export const telegramApp = () => window.Telegram?.WebApp;
export const inTelegram = () => Boolean(telegramApp()?.initData);
export function openExternal(url: string) {
  const app = telegramApp();
  if (inTelegram() && app) {
    if (new URL(url).hostname === 't.me') app.openTelegramLink(url);
    else app.openLink(url);
  } else window.open(url, '_blank', 'noopener,noreferrer');
}
export function useTelegram(route: RouteKey, navigate: (route: RouteKey) => void) {
  useEffect(() => {
    const app = telegramApp();
    if (!app || !inTelegram()) return;
    app.ready();
    app.expand();

    if (app.disableVerticalSwipes && (!app.isVersionAtLeast || app.isVersionAtLeast('7.7')))
      app.disableVerticalSwipes();
    app.setHeaderColor('#101111');
    app.setBackgroundColor('#101111');
  }, []);
  useEffect(() => {
    const app = telegramApp();
    if (!app || !inTelegram()) return;
    const back = () => navigate('home');
    if (route === 'home') app.BackButton.hide();
    else app.BackButton.show();
    app.BackButton.onClick(back);
    return () => {
      app.BackButton.offClick(back);
      app.BackButton.hide();
    };
  }, [route, navigate]);
}

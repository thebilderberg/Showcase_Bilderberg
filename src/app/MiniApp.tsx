import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import './base.css';
import './miniapp.css';
import { Tarot } from './Tarot';
import { Grid } from './Grid';
import { Bio } from './Bio';
import { navigationItems } from './navigation/types';
import { useNavigation } from './navigation/NavigationProvider';
import { Projects } from '../shared/Projects';
import { contactUrl, portfolio, siteUrl } from '../shared/config';
import { inTelegram, openExternal, useTelegram } from '../shared/telegram/webapp';

const pageTitles = {
  home: 'Карты Таро расскажут обо мне.',
  projects: 'Проекты в деталях.',
  widgets: 'Виджеты',
  bio: 'Знакомство за пределами кода.',
};
export function MiniApp() {
  const { route, navigate } = useNavigation();
  useTelegram(route, navigate);
  useEffect(() => {
    document.title = `${pageTitles[route]} · ${portfolio.name}`;
    document.querySelector<HTMLElement>('.app-page-heading')?.focus();
    document
      .querySelector<HTMLElement>(`.app-nav button[aria-current="page"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [route]);
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#d8c298' } }}>
      <div className={`mini-app route-${route}`}>
        <header className="TopBar app-header">
          <a className="wordmark" href="#app">
            {portfolio.name}
            <span> / app</span>
          </a>
          <nav className="app-nav" aria-label="Разделы приложения">
            {navigationItems.map(({ key, label }) => (
              <button
                key={key}
                className={route === key ? 'active' : ''}
                aria-current={route === key ? 'page' : undefined}
                onClick={() => navigate(key)}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>
        <main className="app-main">
          <h1 className="app-page-heading" tabIndex={-1}>
            {pageTitles[route]}
          </h1>
          {route === 'home' ? (
            <Tarot />
          ) : route === 'projects' ? (
            <Projects />
          ) : route === 'widgets' ? (
            <Grid />
          ) : (
            <Bio />
          )}
          <footer className="app-footer">
            {!inTelegram() && <a href={siteUrl}>← На сайт-портфолио</a>}
            {contactUrl && (
              <button className="text-link" onClick={() => openExternal(contactUrl)}>
                Обсудить проект ↗
              </button>
            )}
            <span>React + TypeScript / {portfolio.name}</span>
          </footer>
        </main>
      </div>
    </ConfigProvider>
  );
}

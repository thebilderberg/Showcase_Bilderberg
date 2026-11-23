import React from 'react';
import { useNavigation } from './navigation/NavigationProvider';
import { portfolio } from '../shared/config';
export function Bio() {
  const { navigate } = useNavigation();
  return (
    <section className="bio-page">
      <div className="bio-intro">
        <div>
          <span className="eyebrow">FRONTEND-РАЗРАБОТЧИК</span>
          <h2>{portfolio.name}</h2>
        </div>
        <p>
          За каждым интерфейсом — свой механизм. Я проектирую его и собираю в работающую систему: от
          первого экрана до данных и взаимодействий. Люблю плавное движение и детали, которые
          замечаешь не сразу.
        </p>
      </div>
      <div className="bio-columns">
        <section className="bio-experience">
          <span className="eyebrow">ПРАКТИКА</span>
          <article>
            <span className="bio-date">Начало работы — сентябрь 2023</span>
            <h3>Frontend-разработка / проект РОСАТОМ</h3>
            <p>
              Разработка интерфейсов на React и TypeScript: виджеты с состоянием, модальные окна,
              динамические таблицы и интеграция REST API.
            </p>
            <ul>
              <li>Ant Design, Redux Toolkit, Axios и React Router.</li>
              <li>Кастомные компоненты и хуки, адаптивная вёрстка.</li>
              <li>Jest, React Testing Library и участие в код-ревью.</li>
            </ul>
            <p>
              Доработка существующего проекта на Vue и создание нового приложения на Vue + Electron.
            </p>
          </article>
          <article>
            <span className="bio-date">Внутренние инструменты</span>
            <h3>За интерфейсом</h3>
            <p>
              Вспомогательные скрипты на JavaScript и Python, SQL, документация и настройка сервисов
              на Linux.
            </p>
          </article>
        </section>
        <aside className="bio-skills">
          <span className="eyebrow">ИНСТРУМЕНТЫ</span>
          <h3>Инструменты под задачу.</h3>
          <div className="tags">
            {[
              'React',
              'Vue',
              'Electron',
              'TypeScript',
              'JavaScript',
              'Redux Toolkit',
              'Ant Design',
              'SCSS',
              'REST API',
              'Node.js',
              'SQL',
              'Python',
              'Linux',
              'Git',
              'Jest',
              'Testing Library',
            ].map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <p>Открыт к новым задачам и совместной работе.</p>
        </aside>
      </div>
      <div className="bio-next">
        <h3>Исследование продолжается.</h3>
        <p>Готовые проекты — снаружи. Механизмы и эксперименты — внутри приложения.</p>
        <button className="button primary" onClick={() => navigate('projects')}>
          Посмотреть проекты ↗
        </button>
      </div>
    </section>
  );
}

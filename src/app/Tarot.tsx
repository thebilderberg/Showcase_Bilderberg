import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from './navigation/NavigationProvider';

const cards = [
  {
    image: '1',
    name: 'JavaScript',
    arcana: 'VIII / Сила',
    title: 'Логика, которая оживляет интерфейс.',
    text: 'События, состояния, анимация и работа с данными. То, что превращает страницу в приложение.',
    link: 'widgets',
    action: 'Попробовать виджеты',
  },
  {
    image: '2',
    name: 'React',
    arcana: 'XVI / Башня',
    title: 'Из компонентов — в цельный продукт.',
    text: 'Переиспользуемые элементы, навигация и управление состоянием. Само это приложение — пример работы с React.',
    link: 'projects',
    action: 'Посмотреть проекты',
  },
  {
    image: '3',
    name: 'Testing Library + Jest',
    arcana: 'VII / Колесница',
    title: 'Проверять то, чем пользуется человек.',
    text: 'Тесты поведения: нажатия, ввод, смена состояния и результат. Уверенность в сценарии, а не только в строках кода.',
    link: 'projects',
    action: 'Посмотреть проекты',
  },
  {
    image: '4',
    name: 'API',
    arcana: 'VI / Влюблённые',
    title: 'Соединять интерфейс и данные.',
    text: 'Запросы к серверу, обработка загрузки и ошибок. Например, форма Perspectiva передаёт заявку через сервер в Telegram.',
    link: 'projects',
    action: 'Посмотреть кейсы',
  },
  {
    image: '5',
    name: 'Linux',
    arcana: 'II / Верховная жрица',
    title: 'Думать дальше первого экрана.',
    text: 'Окружение, сервисы и настройка запуска. Проекту важно не только выглядеть, но и работать после развёртывания.',
    link: 'bio',
    action: 'Обо мне',
  },
] as const;
export function Tarot() {
  const { navigate } = useNavigation();
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number; started: number } | null>(null);
  const reduced = useRef(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reduced.current = query.matches;
    };
    update();
    query.addEventListener('change', update);
    return () => {
      query.removeEventListener('change', update);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (index + 1 < cards.length) {
      const image = new Image();
      image.src = `/tarot/${cards[index + 1].image}.webp`;
    }
  }, [index]);
  const card = cards[index];
  function swipe(direction: number) {
    if (leaving || !card) return;
    setDragging(false);
    pointer.current = null;
    setLeaving(true);
    setOffset(direction * 650);
    timer.current = setTimeout(
      () => {
        setIndex((value) => value + 1);
        setOffset(0);
        setLeaving(false);
      },
      reduced.current ? 0 : 260,
    );
  }
  function reset() {
    if (timer.current) clearTimeout(timer.current);
    pointer.current = null;
    setIndex(0);
    setOffset(0);
    setDragging(false);
    setLeaving(false);
  }
  return (
    <section className="tarot-home" aria-label="Технологии в картах Таро">
      <div className="tarot-intro">
        <span className="tarot-subtitle">
          Пять карт — пять сторон моей работы. Смахните карту или воспользуйтесь кнопками.
        </span>
      </div>
      <div className="tarot-layout">
        <div className="deck-area">
          <div className="deck-stars" aria-hidden="true">
            ✧
          </div>
          {card ? (
            <div className="deck-stack">
              {cards.slice(index).map((item, depth) => (
                <div
                  className="deck-layer"
                  key={item.image}
                  style={{
                    zIndex: cards.length - depth,
                    animationDelay: `${(cards.length - depth - 1) * 70}ms`,
                  }}
                >
                  <div
                    className={`tarot-card ${depth ? 'tarot-under-card' : ''} ${!depth && dragging ? 'dragging' : ''} ${!depth && leaving ? 'leaving' : ''}`}
                    role={depth ? undefined : 'group'}
                    aria-hidden={depth ? true : undefined}
                    aria-label={depth ? undefined : `Карта ${index + 1}: ${card.name}`}
                    style={{
                      transform: `translate(${depth ? 0 : offset}px, ${-depth * 4}px) perspective(1500px) rotateX(12deg) rotateY(${!depth ? offset / 220 : 0}deg) rotateZ(${[-7, 8, -10, 5, -3][index + depth] + (!depth ? offset / 22 : 0)}deg) scale(${!depth && dragging ? 1.06 : 1})`,
                      pointerEvents: depth ? 'none' : undefined,
                    }}
                    onPointerDown={(event) => {
                      if (leaving || (event.pointerType === 'mouse' && event.button !== 0)) return;
                      pointer.current = {
                        id: event.pointerId,
                        x: event.clientX,
                        y: event.clientY,
                        started: performance.now(),
                      };
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setDragging(true);
                    }}
                    onPointerMove={(event) => {
                      if (pointer.current?.id !== event.pointerId) return;
                      setOffset(event.clientX - pointer.current.x);
                    }}
                    onPointerUp={(event) => {
                      const start = pointer.current;
                      if (!start || start.id !== event.pointerId) return;
                      const dx = event.clientX - start.x;
                      const dy = event.clientY - start.y;
                      const speed = Math.abs(dx) / Math.max(1, performance.now() - start.started);
                      pointer.current = null;
                      if (
                        Math.abs(dx) > Math.abs(dy) &&
                        (Math.abs(dx) > 70 || (Math.abs(dx) > 30 && speed > 0.45))
                      )
                        swipe(dx > 0 ? 1 : -1);
                      else {
                        setDragging(false);
                        setOffset(0);
                      }
                    }}
                    onPointerCancel={() => {
                      pointer.current = null;
                      setDragging(false);
                      setOffset(0);
                    }}
                  >
                    <img
                      src={`/tarot/${item.image}.webp`}
                      alt={depth ? '' : `Авторская карта Таро: ${item.name}`}
                      draggable={false}
                      fetchPriority={!depth ? 'high' : 'auto'}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="deck-finished">
              <span aria-hidden="true">✦</span>
              <h2>Колода раскрыта.</h2>
              <p>Теперь можно перейти от технологий к работам.</p>
              <button className="button primary" onClick={() => navigate('projects')}>
                Смотреть проекты ↗
              </button>
            </div>
          )}
        </div>
        <div className="tarot-story" aria-live="polite">
          <span className="eyebrow">
            {card
              ? `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')} — ${card.arcana}`
              : `${String(cards.length).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')} — ВСЕ КАРТЫ ОТКРЫТЫ`}
          </span>
          <h2>{card?.title || 'За каждой картой — практика.'}</h2>
          <p>
            {card?.text ||
              'Сайты, интерактивные элементы и работа с сервером собраны в разделе проектов. Колоду можно посмотреть ещё раз.'}
          </p>
          {card && (
            <button className="text-link" onClick={() => navigate(card.link)}>
              {card.action} ↗
            </button>
          )}
          <div
            className="deck-progress"
            aria-label={`Просмотрено ${Math.min(index + 1, cards.length)} из ${cards.length} карт`}
          >
            {cards.map((item, i) => (
              <span key={item.image} className={i <= index ? 'seen' : ''} />
            ))}
          </div>
          <div className="deck-controls">
            {card && (
              <>
                <button
                  className="deck-arrow"
                  aria-label="Смахнуть карту влево"
                  disabled={leaving}
                  onClick={() => swipe(-1)}
                >
                  ←
                </button>
                <span>Смахните в сторону</span>
                <button
                  className="deck-arrow"
                  aria-label="Смахнуть карту вправо"
                  disabled={leaving}
                  onClick={() => swipe(1)}
                >
                  →
                </button>
              </>
            )}
            <button className="text-link deck-reset" onClick={reset}>
              Начать заново ↺
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

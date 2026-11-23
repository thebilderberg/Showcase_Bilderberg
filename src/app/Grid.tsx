import React, { useEffect, useRef, useState } from 'react';
import { Clocks } from './Clocks';
import { Codex } from './Codex';
import { MagnumOpus } from './MagnumOpus';
import { Oculus } from './Oculus';
import { Ouroboros } from './Ouroboros';
import { Speculum } from './Speculum';
import { defaultOrder, moveItem, restoreOrder } from './gridModel';

const storageKey = 'flamel-grid-order-v1';
const dragThreshold = 5;
const tiles: Record<string, { title: string; symbol: string }> = {
  clock: { title: 'Мировое время', symbol: '◷' },
  oculus: { title: 'Oculus', symbol: '△' },
  codex: { title: 'Codex', symbol: '⌑' },
  opus: { title: 'Magnum Opus', symbol: '⌬' },
  speculum: { title: 'Speculum', symbol: '◌' },
  ouroboros: { title: 'Ouroboros', symbol: '∞' },
};

type DragPosition = { id: string; x: number; y: number };
type DragStart = DragPosition & { pointerId: number };

function readSavedOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return restoreOrder(saved);
  } catch {
    return [...defaultOrder];
  }
}

function tileAt(x: number, y: number) {
  return document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-grid-item]')?.dataset
    .gridItem;
}

export function Grid() {
  const [order, setOrder] = useState(readSavedOrder);
  const [drag, setDrag] = useState<DragPosition | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [clockSettingsOpen, setClockSettingsOpen] = useState(false);
  const pointer = useRef<DragStart | null>(null);
  const clockToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!clockSettingsOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      const element = event.target;
      if (
        element instanceof Element &&
        element.closest('.clock-options, .widget-settings-toggle')
      ) {
        return;
      }
      setClockSettingsOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setClockSettingsOpen(false);
      clockToggle.current?.focus({ preventScroll: true });
    }

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [clockSettingsOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(order));
    } catch {}
  }, [order]);

  function move(id: string, to: number) {
    const next = moveItem(order, order.indexOf(id), to);
    if (next === order) return;
    setOrder(next);
    setAnnouncement(`${tiles[id].title}: позиция ${to + 1} из ${order.length}.`);
  }

  function clearDrag() {
    pointer.current = null;
    setDrag(null);
    setTarget(null);
  }

  function handleDragStart(event: React.PointerEvent<HTMLButtonElement>, id: string) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointer.current = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: React.PointerEvent<HTMLButtonElement>) {
    const start = pointer.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (distance < dragThreshold && !drag) return;

    setDrag({ id: start.id, x: event.clientX, y: event.clientY });
    setTarget(tileAt(event.clientX, event.clientY) || null);
  }

  function handleDragEnd(event: React.PointerEvent<HTMLButtonElement>) {
    const start = pointer.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const destination = tileAt(event.clientX, event.clientY);
    if (destination && destination !== start.id) {
      move(start.id, order.indexOf(destination));
    }
    clearDrag();
  }

  function handleMoveKey(event: React.KeyboardEvent<HTMLButtonElement>, id: string, index: number) {
    const previous = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const next = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    if (!previous && !next) return;
    event.preventDefault();
    move(id, index + (previous ? -1 : 1));
  }

  function closeClockSettings() {
    setClockSettingsOpen(false);
    clockToggle.current?.focus({ preventScroll: true });
  }

  function renderWidget(id: string) {
    switch (id) {
      case 'clock':
        return (
          <Clocks compact settingsOpen={clockSettingsOpen} onCloseSettings={closeClockSettings} />
        );
      case 'oculus':
        return <Oculus />;
      case 'codex':
        return <Codex />;
      case 'opus':
        return <MagnumOpus />;
      case 'speculum':
        return <Speculum />;
      case 'ouroboros':
        return <Ouroboros />;
      default:
        return null;
    }
  }

  function resetOrder() {
    setOrder([...defaultOrder]);
    setAnnouncement('Исходный порядок восстановлен.');
  }

  return (
    <section className="grid-demo">
      <div className="demo-intro">
        <div className="eyebrow">ВРЕМЯ, СИМВОЛЫ И БЕСКОНЕЧНОСТЬ.</div>
      </div>
      <ol className="interactive-grid">
        {order.map((id, index) => {
          const tile = tiles[id];
          const picked = drag?.id === id;
          const dropTarget = target === id && !picked;
          return (
            <li
              key={id}
              data-grid-item={id}
              className={`grid-tile tile-${id} ${picked ? 'picked' : ''} ${dropTarget ? 'drop-target' : ''}`}
            >
              <div className="tile-top">
                <span aria-hidden="true" />
                <div className="tile-actions">
                  {id === 'clock' && (
                    <button
                      ref={clockToggle}
                      className="widget-settings-toggle"
                      aria-label="Настройки часов"
                      aria-expanded={clockSettingsOpen}
                      aria-controls="clock-widget-settings"
                      onClick={() => setClockSettingsOpen((open) => !open)}
                    >
                      ⚙
                    </button>
                  )}
                  <button
                    className="drag-handle"
                    aria-label={`Перетащить: ${tile.title}`}
                    onKeyDown={(event) => handleMoveKey(event, id, index)}
                    onPointerDown={(event) => handleDragStart(event, id)}
                    onPointerMove={handleDragMove}
                    onPointerUp={handleDragEnd}
                    onPointerCancel={clearDrag}
                  >
                    ⠿
                  </button>
                </div>
              </div>
              {renderWidget(id)}
              <div className="tile-buttons">
                <button
                  aria-label={`Раньше: ${tile.title}`}
                  disabled={index === 0}
                  onClick={() => move(id, index - 1)}
                >
                  ←
                </button>
                <button
                  aria-label={`Позже: ${tile.title}`}
                  disabled={index === order.length - 1}
                  onClick={() => move(id, index + 1)}
                >
                  →
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {drag && (
        <div className="grid-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {tiles[drag.id].symbol} {tiles[drag.id].title}
        </div>
      )}
      <div className="grid-footer">
        <p role="status">{announcement}</p>
        <button className="text-link" onClick={resetOrder}>
          Сбросить порядок ↺
        </button>
      </div>
    </section>
  );
}

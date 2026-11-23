import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClockMode, meridiem, timezones, zonedTime } from './clockModel';

export function Clocks({
  compact = false,
  settingsOpen = false,
  onCloseSettings,
}: {
  compact?: boolean;
  settingsOpen?: boolean;
  onCloseSettings?: () => void;
}) {
  const [popup, setPopup] = useState({ top: 0, left: 0 });
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!compact || !settingsOpen) return;
    const place = () => {
      const rect = document.querySelector('.widget-settings-toggle')?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(290, window.innerWidth - 24);
      const height = Math.min(panel.current?.offsetHeight || 390, window.innerHeight - 24);
      setPopup({
        left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
        top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - height - 12)),
      });
    };
    place();
    panel.current?.querySelector('select')?.focus({ preventScroll: true });
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [compact, settingsOpen]);
  const [zone, setZone] = useState('Europe/Moscow');
  const [mode, setMode] = useState<ClockMode>('classic');
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext('2d');
    if (!ctx) return;
    const size = 320,
      radius = 150,
      center = size / 2;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = size * ratio;
    element.height = size * ratio;
    const ink = '#f1e8d5';
    const muted = '#777d6d';
    const accent = '#d8c298';
    const base = document.createElement('canvas');
    base.width = element.width;
    base.height = element.height;
    const face = base.getContext('2d');
    if (!face) return;
    face.scale(ratio, ratio);
    face.translate(center, center);
    face.fillStyle = '#181b17';
    face.beginPath();
    face.arc(0, 0, radius, 0, 2 * Math.PI);
    face.fill();
    face.strokeStyle = muted;
    face.lineWidth = 1;
    face.stroke();
    face.textAlign = 'center';
    face.textBaseline = 'middle';
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const inner = i % 5 ? radius - 9 : radius - 16;
      face.beginPath();
      face.strokeStyle = i % 5 ? muted : accent;
      face.lineWidth = i % 5 ? 1 : 2;
      face.moveTo(Math.sin(angle) * inner, -Math.cos(angle) * inner);
      face.lineTo(Math.sin(angle) * (radius - 4), -Math.cos(angle) * (radius - 4));
      face.stroke();
    }
    face.fillStyle = ink;
    face.font = '16px Arial';
    for (let i = 1; i <= 12; i++) {
      const a = (i * Math.PI) / 6;
      face.fillText(String(i), Math.sin(a) * 116, -Math.cos(a) * 116);
    }
    let frame = 0;
    let cachedSecond = -1;
    let parts = zonedTime(new Date(), zone);
    function hand(angle: number, length: number, width: number, color: string, tail = 0) {
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.moveTo(-Math.sin(angle) * tail, Math.cos(angle) * tail);
      ctx.lineTo(Math.sin(angle) * length, -Math.cos(angle) * length);
      ctx.stroke();
    }
    function draw() {
      if (!ctx || !element || document.hidden) return;
      const moment = new Date();
      const secondKey = Math.floor(moment.getTime() / 1000);

      if (secondKey !== cachedSecond) {
        cachedSecond = secondKey;
        parts = zonedTime(moment, zone);
      }
      const seconds = parts.seconds + moment.getMilliseconds() / 1000;
      const minutes = parts.minutes + seconds / 60;
      const hours = parts.hours + minutes / 60;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, element.width, element.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(ratio, 0, 0, ratio, center * ratio, center * ratio);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (mode === 'dayNight') {
        const day = parts.hours >= 6 && parts.hours < 18;
        ctx.fillStyle = '#23291f';
        ctx.beginPath();
        ctx.arc(0, 55, 29, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '29px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.fillText(day ? '☀️' : '🌙', 0, 55);
      }
      if (mode === 'AmPm') {
        const y = 55,
          r = 33,
          phase = (hours / 24) * Math.PI * 2,
          isAm = meridiem(parts.hours) === 'AM';
        ctx.strokeStyle = '#3c4234';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, y, r, -Math.PI / 2, (3 * Math.PI) / 2);
        ctx.stroke();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, y, r, -Math.PI / 2, -Math.PI / 2 + phase);
        ctx.stroke();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(Math.sin(phase) * r, y - Math.cos(phase) * r, 3, 0, 2 * Math.PI);
        ctx.fill();
        for (const [label, x, active] of [
          ['AM', -16, isAm],
          ['PM', 16, !isAm],
        ] as const) {
          ctx.fillStyle = active ? accent : '#23291f';
          ctx.beginPath();
          ctx.roundRect(x - 14, y - 10, 28, 20, 6);
          ctx.fill();
          ctx.font = active ? 'bold 9px Arial' : '9px Arial';
          ctx.fillStyle = active ? '#231f17' : muted;
          ctx.fillText(label, x, y);
        }
        ctx.font = '7px Arial';
        ctx.fillStyle = muted;
        ctx.fillText('24 H', 0, y + 20);
      }
      hand(((hours % 12) * Math.PI) / 6, 65, 5, ink);
      hand((minutes * Math.PI) / 30, 96, 3, ink);
      hand((seconds * Math.PI) / 30, 108, 1.3, accent, 24);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      frame = requestAnimationFrame(draw);
    }
    function visibility() {
      cancelAnimationFrame(frame);
      if (!document.hidden) draw();
    }
    draw();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [zone, mode]);
  const controls = (
    <div className="clock-settings">
      <label htmlFor="clock-zone">Город и часовой пояс</label>
      <select id="clock-zone" value={zone} onChange={(event) => setZone(event.target.value)}>
        {timezones.map(([key, label]) => (
          <option value={key} key={key}>
            {label}
          </option>
        ))}
      </select>
      <label htmlFor="clock-mode">Вид часов</label>
      <select
        id="clock-mode"
        value={mode}
        onChange={(event) => setMode(event.target.value as ClockMode)}
      >
        <option value="classic">Классические</option>
        <option value="dayNight">День / ночь</option>
        <option value="AmPm">AM / PM</option>
      </select>
    </div>
  );
  return (
    <section className={`clock-demo ${compact ? 'clock-compact' : ''}`}>
      {!compact && (
        <div className="demo-intro">
          <span className="eyebrow">ВРЕМЯ В ЛЮБОЙ ТОЧКЕ МИРА</span>
          <p>Один момент. Разные города.</p>
        </div>
      )}
      <div className="clock-panel">
        <div className="clock-face">
          <canvas
            ref={canvas}
            role="img"
            aria-label={`Аналоговые часы, ${timezones.find((item) => item[0] === zone)?.[1] || 'Местное время'}`}
          />
        </div>
        {compact
          ? settingsOpen &&
            createPortal(
              <div
                ref={panel}
                className="clock-options clock-settings-popup"
                id="clock-widget-settings"
                role="dialog"
                aria-label="Настройки часов"
                style={popup}
              >
                <div className="clock-popup-heading">
                  <b>Настройки часов</b>
                  <button
                    type="button"
                    onClick={onCloseSettings}
                    aria-label="Закрыть настройки часов"
                  >
                    ×
                  </button>
                </div>
                {controls}
              </div>,
              document.body,
            )
          : controls}
      </div>
    </section>
  );
}

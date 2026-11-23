import React, { useEffect, useId, useRef } from 'react';

export const depthPhase = (depth: number) => ((depth % 1) + 1) % 1;
export const angleDelta = (next: number, previous: number) =>
  Math.atan2(Math.sin(next - previous), Math.cos(next - previous));
export function Ouroboros() {
  const id = useId().replace(/:/g, '');
  const surface = useRef<HTMLDivElement>(null);
  const rings = useRef<SVGGElement>(null);
  const target = useRef(0);
  const gesture = useRef<{ id: number; angle: number } | null>(null);
  const paint = useRef<() => void>(() => {});
  useEffect(() => {
    const el = surface.current,
      group = rings.current;
    if (!el || !group) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      last = 0,
      current = target.current,
      visible = true;
    const render = () => {
      const phase = depthPhase(current);
      Array.from(group.children).forEach((node, i) => {
        const level = i - phase,
          scale = Math.pow(0.69, level);
        const opacity = Math.max(0, Math.min(1, level * 2, (9 - level) / 3));
        node.setAttribute('transform', `translate(120 120) rotate(${level * 19}) scale(${scale})`);
        node.setAttribute('opacity', String(opacity * 0.75));
      });
      el.dataset.depth = current.toFixed(5);
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!gesture.current && !media.matches) target.current += dt * 0.075;
      current = media.matches
        ? target.current
        : current + (target.current - current) * (1 - Math.exp(-dt * 14));
      render();
      if (visible && !document.hidden && !media.matches) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame || !visible || document.hidden) return;
      last = 0;
      if (media.matches) {
        current = target.current;
        render();
      } else frame = requestAnimationFrame(tick);
    };
    paint.current = () => {
      if (media.matches) {
        current = target.current;
        render();
      } else start();
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      start();
    };
    const visibility = () => {
      gesture.current = null;
      reset();
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            reset();
          });
    observer?.observe(el);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', reset);
    render();
    start();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', reset);
      paint.current = () => {};
    };
  }, []);
  const angle = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(
      event.clientY - rect.y - rect.height / 2,
      event.clientX - rect.x - rect.width / 2,
    );
  };
  return (
    <div className="ouroboros-widget">
      <div
        ref={surface}
        className="ouroboros-surface"
        tabIndex={0}
        role="img"
        aria-label="Ouroboros — бесконечность. Вращайте кольцо для погружения. Стрелки меняют направление, пробел останавливает погружение."
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            Math.hypot(
              event.clientX - rect.x - rect.width / 2,
              event.clientY - rect.y - rect.height / 2,
            ) <
            rect.width * 0.16
          )
            return;
          gesture.current = { id: event.pointerId, angle: angle(event) };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const g = gesture.current;
          if (!g || g.id !== event.pointerId) return;
          const next = angle(event);
          target.current += (angleDelta(next, g.angle) / (Math.PI * 2)) * 3;
          g.angle = next;
          paint.current();
        }}
        onPointerUp={() => {
          gesture.current = null;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onLostPointerCapture={() => {
          gesture.current = null;
        }}
        onKeyDown={(event) => {
          if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', ' '].includes(event.key))
            event.preventDefault();
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') target.current += 0.16;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') target.current -= 0.16;
          if (event.key === ' ') gesture.current = { id: -1, angle: 0 };
          paint.current();
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' && gesture.current?.id === -1) gesture.current = null;
        }}
        onBlur={() => {
          if (gesture.current?.id === -1) gesture.current = null;
        }}
      >
        <svg viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <radialGradient id={`void-${id}`}>
              <stop stopColor="#030606" />
              <stop offset="1" stopColor="#101111" />
            </radialGradient>
            <radialGradient id={`rim-${id}`}>
              <stop stopColor="#a9986c" />
              <stop offset="1" stopColor="#655a41" />
            </radialGradient>
            <clipPath id={`well-${id}`}>
              <circle cx="120" cy="120" r="85" />
            </clipPath>
          </defs>
          <circle cx="120" cy="120" r="87" fill={`url(#void-${id})`} />
          <g clipPath={`url(#well-${id})`}>
            <g ref={rings} fill="none" stroke="#b1a17b" strokeWidth=".7">
              {Array.from({ length: 11 }, (_, i) => (
                <g key={i}>
                  <path d="M0-78 67.55 39H-67.55Z" />
                  <path d="M0 78-67.55-39H67.55Z" opacity=".35" />
                  <circle r="78" opacity=".3" />
                  <circle r="39" opacity=".4" />
                </g>
              ))}
            </g>
          </g>
          <circle cx="120" cy="120" r="87" fill="none" stroke="#4e4938" strokeWidth=".5" />
          <path d="M126 24 A96 96 0 1 1 112 24" fill="none" stroke="#2b2a21" strokeWidth="7" />
          <path
            d="M126 24 A96 96 0 1 1 112 24"
            fill="none"
            stroke={`url(#rim-${id})`}
            strokeWidth="3.8"
          />
          <g stroke="#262820" strokeWidth=".7" opacity=".8">
            {Array.from({ length: 67 }, (_, i) => (
              <path key={i} transform={`rotate(${7 + i * 5.15} 120 120)`} d="m118 22 3 4-3 1" />
            ))}
          </g>
          <path
            d="M108 22Q115 17 127 23L119 28Q112 30 108 26Z"
            fill="#a4956c"
            stroke="#504a36"
            strokeWidth=".6"
          />
          <path d="m119 22 7 1-7 2" fill="none" stroke="#24271f" strokeWidth=".6" />
          <circle cx="114" cy="22" r=".9" fill="#e4d1a3" />
        </svg>
      </div>
    </div>
  );
}

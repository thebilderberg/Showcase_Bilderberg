import React, { useEffect, useId, useRef, useState } from 'react';

export function Oculus() {
  const id = useId().replace(/:/g, '');
  const surface = useRef<HTMLButtonElement>(null);
  const iris = useRef<SVGGElement>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    let frame = 0,
      blinkTimer: ReturnType<typeof setTimeout>,
      visible = !document.hidden;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0,
      previous = 0;
    let closeTimer: ReturnType<typeof setTimeout>;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const follow = (event: PointerEvent) => {
      const rect = surface.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = (event.clientX - rect.left - rect.width / 2) / Math.max(rect.width / 2, 1);
      const dy = (event.clientY - rect.top - rect.height * 0.59) / Math.max(rect.height / 2, 1);
      const length = Math.max(1, Math.hypot(dx, dy));
      tx = (dx / length) * 9;
      ty = (dy / length) * 5;
    };
    const reset = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        tx = 0;
        ty = 0;
      }
    };
    const draw = (now: number) => {
      const dt = Math.min((now - previous) / 1000 || 0, 0.04);
      previous = now;
      const ease = motion.matches ? 1 : 1 - Math.exp(-dt * 9);
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      iris.current?.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      if (visible) frame = requestAnimationFrame(draw);
    };
    const blink = () => {
      if (visible && !motion.matches) {
        setBlinking(true);
        closeTimer = setTimeout(() => setBlinking(false), 170);
      }
      blinkTimer = setTimeout(blink, 4300 + Math.random() * 5200);
    };
    const visibility = () => {
      visible = !document.hidden;
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible) frame = requestAnimationFrame(draw);
      else {
        if (hold.current) clearTimeout(hold.current);
        hold.current = null;
        setActive(false);
      }
    };
    document.addEventListener('pointermove', follow, { passive: true });
    document.addEventListener('pointerdown', follow, { passive: true });
    document.addEventListener('pointerout', reset);
    document.addEventListener('visibilitychange', visibility);
    if (visible) frame = requestAnimationFrame(draw);
    blinkTimer = setTimeout(blink, 5000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(blinkTimer);
      clearTimeout(closeTimer);
      if (hold.current) clearTimeout(hold.current);
      document.removeEventListener('pointermove', follow);
      document.removeEventListener('pointerdown', follow);
      document.removeEventListener('pointerout', reset);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const end = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
    setActive(false);
  };
  const begin = () => {
    if (hold.current || revealed) return;
    setActive(true);
    hold.current = setTimeout(() => {
      setRevealed(true);
      hold.current = null;
      setActive(false);
    }, 3000);
  };
  return (
    <div className={`oculus ${active ? 'is-attentive' : ''} ${revealed ? 'is-revealed' : ''}`}>
      <button
        ref={surface}
        className="oculus-surface"
        aria-label="Oculus — Всевидящее око"
        aria-expanded={revealed}
        aria-controls={`oculus-secret-${id}`}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') begin();
        }}
        onPointerLeave={end}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          begin();
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== 'mouse') end();
        }}
        onPointerCancel={end}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!event.repeat) begin();
          }
          if (event.key === 'Escape') {
            end();
            setRevealed(false);
          }
        }}
        onKeyUp={end}
        onBlur={end}
      >
        <svg viewBox="0 0 220 220" role="img" aria-label="Золотой треугольник с живым глазом">
          <defs>
            <radialGradient id={`iris-${id}`}>
              <stop stopColor="#d9c18c" />
              <stop offset=".55" stopColor="#8b7448" />
              <stop offset="1" stopColor="#2b261d" />
            </radialGradient>
            <clipPath id={`eye-${id}`}>
              <path d="M62 128Q110 84 158 128Q110 172 62 128Z" />
            </clipPath>
          </defs>
          <g className="oculus-coordinates" stroke="#746448" strokeWidth=".5" opacity=".3">
            <path d="M25 128H195M110 32V194M50 60V186M170 60V186M30 80H190M30 172H190" />
            <circle cx="110" cy="128" r="65" fill="none" />
          </g>
          <path d="M110 27 202 185H18Z" fill="none" stroke="#c1a86e" strokeWidth="1.4" />
          <path d="m110 39 82 140H28Z" fill="none" stroke="#776344" strokeWidth=".5" />
          <g stroke="#907a51" strokeWidth=".8" opacity=".7">
            <path d="M110 8V19M91 14l4 9M129 14l-4 9M9 168l10 5M211 168l-10 5M40 202l6-10M180 202l-6-10M110 194v12" />
          </g>
          <g className={`oculus-eye ${blinking ? 'is-blinking' : ''}`}>
            <path
              d="M62 128Q110 84 158 128Q110 172 62 128Z"
              fill="#d3c5a2"
              fillOpacity=".07"
              stroke="#cbb480"
              strokeWidth="1.2"
            />
            <g clipPath={`url(#eye-${id})`}>
              <g ref={iris}>
                <circle
                  cx="110"
                  cy="128"
                  r="20"
                  fill={`url(#iris-${id})`}
                  stroke="#c7ac72"
                  strokeWidth=".65"
                />
                {Array.from({ length: 28 }, (_, i) => {
                  const a = (i * Math.PI) / 14;
                  return (
                    <path
                      key={i}
                      d={`M${110 + Math.cos(a) * 11} ${128 + Math.sin(a) * 11}L${110 + Math.cos(a) * 18} ${128 + Math.sin(a) * 18}`}
                      stroke="#d4b778"
                      strokeWidth=".55"
                      opacity=".55"
                    />
                  );
                })}
                <circle cx="110" cy="128" r="9" fill="#080a09" />
                <circle cx="105" cy="122" r="2.3" fill="#e5d8b7" opacity=".8" />
              </g>
            </g>
            <path d="M62 126Q110 74 158 126" fill="none" stroke="#8a734b" strokeWidth=".7" />
          </g>
          <circle cx="110" cy="27" r="2" fill="#d3bc87" />
        </svg>
      </button>
      {revealed && (
        <div className="oculus-secret" id={`oculus-secret-${id}`} role="status">
          <span>B / 01</span>
          <p>
            За механизмом — человек.
            <br />
            За интерфейсом — Bilderberg.
          </p>
          <a href="#app/bio">Открыть досье ↗</a>
          <button aria-label="Закрыть запись" onClick={() => setRevealed(false)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

const mirrorSize = 240;
const bufferSize = mirrorSize * 2;
const traceLifetime = 2200;
const traceLimit = 18;
const sampleInterval = 35;

function createBuffer() {
  const buffer = document.createElement('canvas');
  buffer.width = buffer.height = bufferSize;
  return buffer;
}

type Trace = { x: number; y: number; born: number };
export function Speculum() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reveal = useRef<(x: number, y: number) => void>(() => {});
  const position = useRef({ x: 120, y: 120 });
  useEffect(() => {
    const element = canvas.current;
    if (!element || typeof CanvasRenderingContext2D === 'undefined') return;
    const context = element.getContext('2d');
    if (!context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = element.height = mirrorSize * ratio;
    context.scale(ratio, ratio);
    const underlay = createBuffer();
    const ink = underlay.getContext('2d');
    if (!ink) return;
    ink.scale(2, 2);
    const mask = createBuffer();
    const light = mask.getContext('2d');
    if (!light) return;
    const lights = createBuffer();
    const glow = lights.getContext('2d');
    if (!glow) return;
    let traces: Trace[] = [];
    let frame = 0;
    let lastSample = -100;
    let disposed = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rabbit = new Image();
    const blueprint = () => {
      ink.clearRect(0, 0, mirrorSize, mirrorSize);
      ink.fillStyle = '#111918';
      ink.fillRect(0, 0, mirrorSize, mirrorSize);
      ink.lineWidth = 0.45;
      ink.strokeStyle = '#547773';
      for (let n = 15; n < mirrorSize; n += 15) {
        ink.beginPath();
        ink.moveTo(n, 0);
        ink.lineTo(n, mirrorSize);
        ink.moveTo(0, n);
        ink.lineTo(mirrorSize, n);
        ink.stroke();
      }
      ink.strokeStyle = '#b7b39a';
      ink.strokeRect(27, 35, 186, 160);
      ink.strokeRect(34, 43, 172, 14);
      ink.font = '5px monospace';
      ink.fillStyle = '#b4c5bb';
      ink.fillText('B / INTERFACE', 39, 52);
      for (let i = 0; i < 6; i++) {
        const x = 35 + (i % 3) * 58,
          y = 69 + Math.floor(i / 3) * 56;
        ink.strokeRect(x, y, 54, 49);
        ink.beginPath();
        ink.arc(x + 27, y + 22, 12, 0, Math.PI * 2);
        ink.stroke();
        ink.beginPath();
        ink.moveTo(x + 10, y + 41);
        ink.lineTo(x + 44, y + 41);
        ink.stroke();
      }
      ink.font = '5px monospace';
      ink.fillText('view → state → render', 35, 187);
      ink.fillText('/app  /widgets  /projects', 35, 209);
      ink.setLineDash([2, 3]);
      ink.strokeStyle = '#c5b78d';
      ink.beginPath();
      ink.moveTo(17, 29);
      ink.lineTo(223, 29);
      ink.moveTo(19, 23);
      ink.lineTo(19, 218);
      ink.stroke();
      ink.setLineDash([]);
      if (rabbit.complete && rabbit.naturalWidth) {
        ink.save();
        ink.globalCompositeOperation = 'screen';
        ink.globalAlpha = 0.9;
        ink.drawImage(rabbit, 169, 164, 27, 27);
        ink.restore();
      }
    };
    const draw = (now: number) => {
      frame = 0;
      if (disposed) return;
      traces = traces.filter((trace) => now - trace.born < traceLifetime);
      context.clearRect(0, 0, mirrorSize, mirrorSize);
      context.fillStyle = '#101111';
      context.fillRect(0, 0, mirrorSize, mirrorSize);
      context.save();
      context.beginPath();
      context.roundRect(7, 9, 226, 222, 34);
      context.clip();
      const glass = context.createLinearGradient(0, 0, mirrorSize, mirrorSize);
      glass.addColorStop(0, '#161a1a');
      glass.addColorStop(0.45, '#090c0d');
      glass.addColorStop(1, '#111515');
      context.fillStyle = glass;
      context.fillRect(0, 0, mirrorSize, mirrorSize);
      light.clearRect(0, 0, bufferSize, bufferSize);
      light.globalCompositeOperation = 'source-over';
      light.drawImage(underlay, 0, 0);
      light.globalCompositeOperation = 'destination-in';

      glow.clearRect(0, 0, bufferSize, bufferSize);
      traces.forEach((trace) => {
        const age = (now - trace.born) / traceLifetime,
          strength = Math.pow(1 - age, 1.5);
        const radius = reduced.matches ? 69 : 48 + age * 34;
        const gradient = glow.createRadialGradient(
          trace.x * 2,
          trace.y * 2,
          0,
          trace.x * 2,
          trace.y * 2,
          radius * 2,
        );
        gradient.addColorStop(0, `rgba(255,255,255,${strength})`);
        gradient.addColorStop(0.5, `rgba(255,255,255,${strength * 0.7})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        glow.fillStyle = gradient;
        glow.fillRect(0, 0, bufferSize, bufferSize);
      });
      light.drawImage(lights, 0, 0);
      context.drawImage(mask, 0, 0, mirrorSize, mirrorSize);
      if (!reduced.matches)
        traces.forEach((trace) => {
          const age = (now - trace.born) / traceLifetime;
          context.strokeStyle = `rgba(155,180,174,${(1 - age) * 0.23})`;
          context.lineWidth = 0.45;
          context.beginPath();
          context.ellipse(trace.x, trace.y, 5 + age * 84, 3 + age * 54, -0.2, 0, Math.PI * 2);
          context.stroke();
        });
      context.restore();
      context.strokeStyle = '#363e3b';
      context.lineWidth = 0.6;
      context.beginPath();
      context.roundRect(7, 9, 226, 222, 34);
      context.stroke();
      if (traces.length && !document.hidden) frame = requestAnimationFrame(draw);
    };
    reveal.current = (x, y) => {
      const now = performance.now();
      if (now - lastSample < sampleInterval) return;
      lastSample = now;
      traces.push({ x, y, born: now });
      traces = traces.slice(-traceLimit);
      if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
    };
    rabbit.onload = () => {
      blueprint();
      if (!frame) frame = requestAnimationFrame(draw);
    };
    rabbit.src = '/favicon-original-rabbit-180.png';
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      traces = [];
      if (!document.hidden) draw(performance.now());
    };
    document.addEventListener('visibilitychange', visibility);
    blueprint();
    draw(performance.now());
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      rabbit.onload = null;
      reveal.current = () => {};
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.x) / rect.width) * mirrorSize,
      y = ((event.clientY - rect.y) / rect.height) * mirrorSize;
    position.current = { x, y };
    reveal.current(x, y);
  };
  return (
    <div className="speculum-widget">
      <canvas
        ref={canvas}
        className="speculum-surface"
        role="img"
        tabIndex={0}
        aria-label="Speculum — чёрное зеркало. Касание проявляет чертёж. С клавиатуры: стрелки, Enter или пробел."
        onPointerDown={point}
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse' || event.buttons) point(event);
        }}
        onFocus={() => reveal.current(120, 120)}
        onKeyDown={(event) => {
          if (
            !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)
          )
            return;
          event.preventDefault();
          const next = { ...position.current };
          if (event.key === 'ArrowLeft') next.x -= 18;
          if (event.key === 'ArrowRight') next.x += 18;
          if (event.key === 'ArrowUp') next.y -= 18;
          if (event.key === 'ArrowDown') next.y += 18;
          next.x = Math.max(20, Math.min(220, next.x));
          next.y = Math.max(20, Math.min(220, next.y));
          position.current = next;
          reveal.current(next.x, next.y);
        }}
      />
    </div>
  );
}

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const elements = [
  { name: 'Огонь', path: 'M0 -9 8 6H-8Z', color: '#d49a72' },
  { name: 'Воздух', path: 'M0 -9 8 6H-8ZM-6 1H6', color: '#d9cfac' },
  { name: 'Вода', path: 'M0 9 8 -6H-8Z', color: '#87aaa9' },
  { name: 'Земля', path: 'M0 9 8 -6H-8ZM-6 -1H6', color: '#a4ad81' },
];
function Seal({ mask, artRef }: { mask: number; artRef?: React.Ref<SVGSVGElement> }) {
  const id = useId().replace(/:/g, '');
  const count = elements.filter((_, i) => mask & (1 << i)).length;
  const complete = mask === 15;
  const color = complete ? '#e7d3a0' : elements.find((_, i) => mask & (1 << i))?.color || '#8e805f';
  const points = (n: number, radius: number, skip = 1) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i * skip * Math.PI * 2) / n - Math.PI / 2;
      return `${120 + Math.cos(a) * radius},${120 + Math.sin(a) * radius}`;
    }).join(' ');
  return (
    <svg
      ref={artRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      role="img"
      aria-label={complete ? 'Алхимический артефакт' : 'Алхимическая печать'}
      style={{ color }}
    >
      <defs>
        <radialGradient id={`aether-${id}`}>
          <stop stopColor={color} stopOpacity={complete ? '.24' : '.1'} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="79" fill={`url(#aether-${id})`} />
      <g fill="none" stroke={color} strokeWidth=".7">
        <circle cx="120" cy="120" r="78" opacity=".45" />
        <circle cx="120" cy="120" r="73" opacity=".7" />
        <g
          className={`opus-orbit opus-orbit-${mask & 4 ? 'water' : mask & 1 ? 'fire' : 'air'}`}
          style={{ animationDuration: `${complete ? 36 : 65 - count * 9}s` }}
        >
          {Array.from({ length: 48 }, (_, i) => (
            <path
              key={i}
              transform={`rotate(${i * 7.5} 120 120)`}
              d={`M120 42v${i % 4 ? 2 : 5}`}
              opacity={i % 4 ? '.35' : '.8'}
            />
          ))}
          <polygon points={points(3 + count, 64)} opacity=".8" />
          {(mask & 2) !== 0 && (
            <polygon points={points(3 + count, 58)} transform="rotate(180 120 120)" opacity=".45" />
          )}
        </g>
        <g className={`opus-counter ${mask & 8 ? 'opus-grounded' : ''}`}>
          {(mask & 4) !== 0 &&
            [38, 45, 52].map((r) => <circle key={r} cx="120" cy="120" r={r} opacity=".35" />)}
          {(mask & 1) !== 0 && <polygon points={points(3, 43)} strokeWidth="1.1" />}
          {(mask & 8) !== 0 && (
            <rect
              x="87"
              y="87"
              width="66"
              height="66"
              transform="rotate(45 120 120)"
              opacity=".6"
            />
          )}
          {complete && (
            <>
              {Array.from({ length: 6 }, (_, i) => (
                <circle
                  key={i}
                  cx={120 + Math.cos((i * Math.PI) / 3) * 22}
                  cy={120 + Math.sin((i * Math.PI) / 3) * 22}
                  r="22"
                  opacity=".65"
                />
              ))}
              <polygon points={points(7, 60, 3)} strokeWidth=".5" />
            </>
          )}
        </g>
        <circle cx="120" cy="120" r="15" />
        <path d="m120 109 8 11-8 11-8-11Z" />
      </g>
      <circle
        className={mask ? 'opus-heart' : ''}
        cx="120"
        cy="120"
        r={complete ? 3 : 1.6}
        fill={color}
      />
      {elements.map((element, i) => {
        const a = (i * Math.PI) / 2;
        return (
          <g
            key={element.name}
            transform={`translate(${120 + Math.sin(a) * 101} ${120 - Math.cos(a) * 101})`}
          >
            <circle
              r="16"
              fill="#101111"
              stroke={mask & (1 << i) ? element.color : '#484638'}
              strokeWidth=".7"
            />
            <path
              d={element.path}
              fill="none"
              stroke={mask & (1 << i) ? element.color : '#82775c'}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}
export function MagnumOpus() {
  const [mask, setMask] = useState(0);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const art = useRef<SVGSVGElement>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const el = dialog.current!;
    el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const toggle = (i: number) => {
    setMask((value) => value ^ (1 << i));
    setStatus('');
  };
  const save = async () => {
    if (!art.current || saving) return;
    setSaving(true);
    setStatus('');
    let url = '';
    try {
      const clone = art.current.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('width', '1200');
      clone.setAttribute('height', '1200');
      const source = new XMLSerializer().serializeToString(clone);
      url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('image'));
        image.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1200;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('canvas');
      context.fillStyle = '#101111';
      context.fillRect(0, 0, 1200, 1200);
      context.drawImage(image, 0, 0, 1200, 1200);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('png'))),
          'image/png',
        ),
      );
      const file = new File([blob], 'magnum-opus.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] });
      else {
        const download = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = download;
        anchor.download = file.name;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(download), 10000);
      }
    } catch (error) {
      if (mounted.current && (error as Error).name !== 'AbortError')
        setStatus('Не удалось сохранить. Попробуйте открыть приложение в браузере.');
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (mounted.current) setSaving(false);
    }
  };
  const surface = (expanded = false) => (
    <div className="opus-surface">
      <Seal mask={mask} artRef={expanded ? art : undefined} />
      {elements.map((element, i) => (
        <button
          key={element.name}
          className={`opus-element opus-element-${i}`}
          aria-label={element.name}
          aria-pressed={!!(mask & (1 << i))}
          onClick={() => toggle(i)}
        />
      ))}
      {!expanded && (
        <button
          ref={trigger}
          className="opus-open"
          aria-label="Открыть алхимическую печать"
          onClick={() => setOpen(true)}
        />
      )}
    </div>
  );
  return (
    <div className="opus-widget">
      {surface()}
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="codex-dialog opus-dialog"
            aria-label="Magnum Opus"
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="widget-dialog-actions">
              <button aria-label="Закрыть печать" onClick={close}>
                ×
              </button>
            </div>
            <div className="opus-dialog-body">
              {surface(true)}
              {mask === 15 && (
                <button className="opus-save" disabled={saving} onClick={save}>
                  {saving ? 'Создание…' : 'Сохранить артефакт ↓'}
                </button>
              )}
              <span role="status" className="opus-status">
                {status}
              </span>
            </div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Alphabet, alphabets, archiveCipher, archivePhrase, caesar, modulo } from './cipherModel';

type DialProps = {
  alphabet: string;
  shift: number;
  change: (shift: number) => void;
  open?: () => void;
  label: string;
};
function CipherDial({ alphabet, shift, change, open, label }: DialProps) {
  const id = useId().replace(/:/g, '');
  const svg = useRef<SVGSVGElement>(null);
  const gesture = useRef<{
    id: number;
    last: number;
    rotation: number;
    key: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const step = 360 / alphabet.length;
  const angle = (event: React.PointerEvent) => {
    const rect = svg.current!.getBoundingClientRect();
    return (
      (Math.atan2(
        event.clientY - rect.top - rect.height / 2,
        event.clientX - rect.left - rect.width / 2,
      ) *
        180) /
      Math.PI
    );
  };
  const letters = (radius: number, inner = false) =>
    Array.from(alphabet).map((letter, i) => {
      const a = (i * Math.PI * 2) / alphabet.length;
      return (
        <text
          key={letter}
          x={110 + Math.sin(a) * radius}
          y={110 - Math.cos(a) * radius}
          textAnchor="middle"
          dominantBaseline="central"
          transform={
            inner
              ? `rotate(${shift * step} ${110 + Math.sin(a) * radius} ${110 - Math.cos(a) * radius})`
              : undefined
          }
        >
          {letter}
        </text>
      );
    });
  return (
    <div
      className="codex-dial"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={alphabet.length - 1}
      aria-valuenow={shift}
      onKeyDown={(event) => {
        if (
          ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(
            event.key,
          )
        )
          event.preventDefault();
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
          change(modulo(shift + 1, alphabet.length));
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
          change(modulo(shift - 1, alphabet.length));
        if (event.key === 'Home') change(0);
        if (event.key === 'End') change(alphabet.length - 1);
        if (event.key === 'Enter' || event.key === ' ') open?.();
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        gesture.current = {
          id: event.pointerId,
          last: angle(event),
          rotation: 0,
          key: shift,
          x: event.clientX,
          y: event.clientY,
          moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const g = gesture.current;
        if (!g || g.id !== event.pointerId) return;
        if (!g.moved && Math.hypot(event.clientX - g.x, event.clientY - g.y) < 6) return;
        g.moved = true;
        const next = angle(event);
        let delta = next - g.last;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        g.rotation += delta;
        g.last = next;
        change(modulo(g.key - Math.round(g.rotation / step), alphabet.length));
      }}
      onPointerUp={(event) => {
        const g = gesture.current;
        if (g?.id !== event.pointerId) return;
        gesture.current = null;
        if (!g.moved) open?.();
      }}
      onPointerCancel={() => {
        gesture.current = null;
      }}
      onClick={(event) => {
        if (event.detail === 0) open?.();
      }}
    >
      <svg ref={svg} viewBox="0 0 220 220" role="img" aria-label="Два латунных кольца с буквами">
        <defs>
          <radialGradient id={`brass-${id}`}>
            <stop stopColor="#27251c" />
            <stop offset="1" stopColor="#131613" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="98" fill="none" stroke="#64593f" strokeWidth=".6" />
        <circle cx="110" cy="110" r="94" fill="none" stroke="#b49e6b" strokeWidth="1" />
        <g stroke="#87734d" strokeWidth=".6">
          {Array.from({ length: alphabet.length * 2 }, (_, i) => {
            const a = (i * Math.PI) / alphabet.length;
            return (
              <path
                key={i}
                d={`M${110 + Math.sin(a) * 95} ${110 - Math.cos(a) * 95}L${110 + Math.sin(a) * 99} ${110 - Math.cos(a) * 99}`}
              />
            );
          })}
        </g>
        <g className="codex-outer">{letters(82)}</g>
        <circle
          cx="110"
          cy="110"
          r="70"
          fill={`url(#brass-${id})`}
          stroke="#766342"
          strokeWidth=".7"
        />
        <g transform={`rotate(${-shift * step} 110 110)`} className="codex-rotor">
          <g className="codex-inner">{letters(57, true)}</g>
          <circle cx="110" cy="110" r="44" fill="none" stroke="#65583e" strokeWidth=".6" />
          {[0, 90, 180, 270].map((a) => (
            <circle
              key={a}
              cx={110 + Math.sin((a * Math.PI) / 180) * 40}
              cy={110 - Math.cos((a * Math.PI) / 180) * 40}
              r="1"
              fill="#bcaa76"
            />
          ))}
        </g>
        <circle cx="110" cy="110" r="30" fill="none" stroke="#a38b58" strokeWidth=".6" />
        <path d="m110 90 15 20-15 20-15-20Z" fill="none" stroke="#bca477" strokeWidth=".8" />
        <circle cx="110" cy="107" r="4" fill="#bca477" />
        <path d="m108 110-2 8h8l-2-8" fill="#bca477" />
        <path d="m110 8-3-6h6Z" fill="#d6c192" />
      </svg>
    </div>
  );
}
export function Codex() {
  const [alphabet, setAlphabet] = useState<Alphabet>('en');
  const [shift, setShift] = useState(3);
  const [text, setText] = useState('LUMEN');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const inputId = useId(),
    outputId = useId(),
    keyId = useId(),
    alphabetId = useId();
  const output = caesar(text, mode === 'encrypt' ? shift : -shift);
  const solved = mode === 'decrypt' && text === archiveCipher && output === archivePhrase;
  const close = () => {
    setOpen(false);
    surface.current?.querySelector<HTMLElement>('[role="slider"]')?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!open) return;
    const el = dialog.current;
    if (!el) return;
    if (el.showModal) el.showModal();
    else el.setAttribute('open', '');
    return () => {
      if (el.open) el.close?.();
    };
  }, [open]);
  useEffect(() => {
    setCopyStatus('');
  }, [output]);
  const changeAlphabet = (value: Alphabet) => {
    setAlphabet(value);
    setShift((current) => modulo(current, alphabets[value].length));
  };
  return (
    <div className="codex-widget" ref={surface}>
      <CipherDial
        alphabet={alphabets[alphabet]}
        shift={shift}
        change={setShift}
        open={() => {
          setCopyStatus('');
          setOpen(true);
        }}
        label="Codex — шифровальный диск"
      />
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="codex-dialog"
            aria-label="Codex"
            onCancel={(event) => {
              event.preventDefault();
              close();
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div className="widget-dialog-actions">
              <button
                className="codex-archive"
                aria-label="Открыть запись из архива"
                onClick={() => {
                  setAlphabet('ru');
                  setShift(0);
                  setText(archiveCipher);
                  setMode('decrypt');
                }}
              >
                ⌑
              </button>
              <button aria-label="Закрыть Codex" onClick={close}>
                ×
              </button>
            </div>
            <div className="codex-dialog-body">
              <CipherDial
                alphabet={alphabets[alphabet]}
                shift={shift}
                change={setShift}
                label="Ключ шифра на диске"
              />
              <div className="codex-mode">
                <button aria-pressed={mode === 'encrypt'} onClick={() => setMode('encrypt')}>
                  Зашифровать
                </button>
                <button aria-pressed={mode === 'decrypt'} onClick={() => setMode('decrypt')}>
                  Расшифровать
                </button>
              </div>
              <div className="codex-key-row">
                <label htmlFor={alphabetId}>
                  Алфавит
                  <select
                    id={alphabetId}
                    value={alphabet}
                    onChange={(event) => changeAlphabet(event.target.value as Alphabet)}
                  >
                    <option value="en">A–Z</option>
                    <option value="ru">А–Я</option>
                  </select>
                </label>
                <label htmlFor={keyId}>
                  Ключ <output>{shift}</output>
                  <input
                    id={keyId}
                    aria-label="Сдвиг шифра"
                    type="range"
                    min="0"
                    max={alphabets[alphabet].length - 1}
                    value={shift}
                    onChange={(event) => setShift(Number(event.target.value))}
                  />
                </label>
              </div>
              <label htmlFor={inputId}>{mode === 'encrypt' ? 'Сообщение' : 'Шифр'}</label>
              <textarea
                id={inputId}
                rows={2}
                maxLength={280}
                value={text}
                onChange={(event) => {
                  const value = event.target.value;
                  setText(value);
                  if (/[А-ЯЁа-яё]/.test(value) && !/[a-z]/i.test(value) && alphabet !== 'ru')
                    changeAlphabet('ru');
                }}
              />
              <label htmlFor={outputId}>Результат</label>
              <textarea id={outputId} rows={2} value={output} readOnly />
              <div className="codex-result-actions">
                <button
                  onClick={() => {
                    setText(output);
                    setMode((current) => (current === 'encrypt' ? 'decrypt' : 'encrypt'));
                  }}
                >
                  Обратить ↔
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(output);
                      setCopyStatus('Скопировано');
                    } catch {
                      setCopyStatus('Выделите результат и скопируйте вручную');
                    }
                  }}
                >
                  Копировать
                </button>
              </div>
              <span className="codex-copy-status" role="status">
                {copyStatus}
              </span>
              {solved && (
                <div className="codex-seal" role="status">
                  ◇<span>Печать раскрыта</span>
                </div>
              )}
            </div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}

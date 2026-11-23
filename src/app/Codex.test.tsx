import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Codex } from './Codex';
import { alphabets, archivePhrase, caesar } from './cipherModel';
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
test('Caesar round trips every shift in both alphabets, preserving case and punctuation', () => {
  expect(caesar('AZ az', 1)).toBe('BA ba');
  expect(caesar('ЕЁЖ я', 1)).toBe('ЁЖЗ а');
  for (const alphabet of Object.values(alphabets))
    for (let shift = 0; shift < alphabet.length; shift++) {
      const source = alphabet + alphabet.toLowerCase() + ' 123 — ✦';
      expect(caesar(caesar(source, shift), -shift)).toBe(source);
    }
  expect(caesar('Hello, Мир! 🙂', 0)).toBe('Hello, Мир! 🙂');
  expect(caesar('ABC', -1)).toBe('ZAB');
});
test('disk opens, changes key, reverses text and copies the result', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(<Codex />);
  const disk = screen.getByRole('slider', { name: 'Codex — шифровальный диск' });
  fireEvent.keyDown(disk, { key: 'ArrowRight' });
  expect(disk.getAttribute('aria-valuenow')).toBe('4');
  fireEvent.keyDown(disk, { key: 'Enter' });
  expect(screen.getByRole('dialog', { name: 'Codex' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Сообщение'), { target: { value: 'ABC' } });
  expect((screen.getByLabelText('Результат') as HTMLTextAreaElement).value).toBe('EFG');
  fireEvent.click(screen.getByRole('button', { name: 'Обратить ↔' }));
  expect((screen.getByLabelText('Результат') as HTMLTextAreaElement).value).toBe('ABC');
  fireEvent.click(screen.getByRole('button', { name: 'Копировать' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('ABC'));
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть Codex' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
test('archive seal stays closed until the message is decoded with its key', () => {
  render(<Codex />);
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Codex — шифровальный диск' }), {
    key: 'Enter',
  });
  fireEvent.click(screen.getByRole('button', { name: 'Открыть запись из архива' }));
  expect(screen.queryByText('Печать раскрыта')).toBeNull();
  fireEvent.change(screen.getByRole('slider', { name: 'Сдвиг шифра' }), { target: { value: '7' } });
  expect((screen.getByLabelText('Результат') as HTMLTextAreaElement).value).toBe(archivePhrase);
  expect(screen.getByText('Печать раскрыта')).toBeTruthy();
});

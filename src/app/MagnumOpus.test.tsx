import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MagnumOpus } from './MagnumOpus';
import { restoreOrder } from './gridModel';
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
test('elements combine across tile and dialog, artifact requires all four and can be reversed', () => {
  render(<MagnumOpus />);
  fireEvent.click(screen.getByRole('button', { name: 'Огонь' }));
  expect(screen.getByRole('button', { name: 'Огонь' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Открыть алхимическую печать' }));
  const modal = within(screen.getByRole('dialog', { name: 'Magnum Opus' }));
  expect(modal.queryByRole('button', { name: 'Сохранить артефакт ↓' })).toBeNull();
  ['Воздух', 'Вода', 'Земля'].forEach((name) =>
    fireEvent.click(modal.getByRole('button', { name })),
  );
  expect(modal.getByRole('img', { name: 'Алхимический артефакт' })).toBeTruthy();
  expect(modal.getByRole('button', { name: 'Сохранить артефакт ↓' })).toBeTruthy();
  fireEvent.click(modal.getByRole('button', { name: 'Вода' }));
  expect(modal.queryByRole('button', { name: 'Сохранить артефакт ↓' })).toBeNull();
  fireEvent.click(modal.getByRole('button', { name: 'Закрыть печать' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'Вода' }).getAttribute('aria-pressed')).toBe('false');
});
test('old data tile migrates in place and duplicate aliases cannot duplicate tiles', () => {
  expect(restoreOrder(['delivery', 'data', 'clock', 'testing', 'codex', 'oculus'])).toEqual([
    'ouroboros',
    'opus',
    'clock',
    'speculum',
    'codex',
    'oculus',
  ]);
  expect(new Set(restoreOrder(['opus', 'data', 'clock', 'testing', 'codex', 'oculus'])).size).toBe(
    6,
  );
});

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Oculus } from './Oculus';
import { Tarot } from './Tarot';
import { Grid } from './Grid';
import { NavigationProvider } from './navigation/NavigationProvider';
import { meridiem, zonedTime } from './clockModel';
import { defaultOrder, moveItem, validOrder, restoreOrder } from './gridModel';

jest.mock('./Clocks', () => ({ Clocks: () => <div aria-label="Виджет часов" /> }));
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
  });
});
afterEach(() => {
  localStorage.clear();
  jest.useRealTimers();
});
test('the complete deck can be read, finished and restarted without a swipe', () => {
  jest.useFakeTimers();
  render(
    <NavigationProvider>
      <Tarot />
    </NavigationProvider>,
  );
  expect(screen.getByRole('group', { name: 'Карта 1: JavaScript' })).toBeTruthy();
  for (let i = 0; i < 5; i++) {
    fireEvent.click(screen.getByRole('button', { name: 'Смахнуть карту вправо' }));
    act(() => {
      jest.advanceTimersByTime(300);
    });
  }
  expect(screen.getByRole('heading', { name: 'Колода раскрыта.' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Начать заново ↺' }));
  expect(screen.getByRole('group', { name: 'Карта 1: JavaScript' })).toBeTruthy();
});
test('unmounting a deck cancels its pending animation', () => {
  jest.useFakeTimers();
  const { unmount } = render(
    <NavigationProvider>
      <Tarot />
    </NavigationProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Смахнуть карту влево' }));
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});
test('timezones follow winter and summer offsets and noon is PM', () => {
  expect(zonedTime(new Date('2025-01-15T12:00:00Z'), 'America/New_York').hours).toBe(7);
  expect(zonedTime(new Date('2025-07-15T12:00:00Z'), 'America/New_York').hours).toBe(8);
  expect(zonedTime(new Date('2025-01-15T23:30:00Z'), 'Europe/Moscow')).toMatchObject({
    hours: 2,
    minutes: 30,
  });
  expect(meridiem(0)).toBe('AM');
  expect(meridiem(11)).toBe('AM');
  expect(meridiem(12)).toBe('PM');
  expect(meridiem(23)).toBe('PM');
});
test('moving grid elements keeps every tile once and validates stored data', () => {
  const moved = moveItem(defaultOrder, 0, 4);
  expect(moved[4]).toBe('clock');
  expect(new Set(moved).size).toBe(6);
  expect(defaultOrder[0]).toBe('clock');
  expect(moveItem(defaultOrder, -1, 0)).toBe(defaultOrder);
  expect(validOrder(moved)).toBe(true);
  expect(validOrder(['interface', 'interface'])).toBe(false);
});
test('grid ignores corrupt storage and preserves keyboard ordering on remount', () => {
  localStorage.setItem('flamel-grid-order-v1', '["unknown"]');
  const { unmount } = render(<Grid />);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Перетащить: Oculus' }), {
    key: 'ArrowRight',
  });
  expect(JSON.parse(localStorage.getItem('flamel-grid-order-v1')!)[2]).toBe('oculus');
  unmount();
  render(<Grid />);
  expect(screen.getAllByRole('listitem')[2].getAttribute('data-grid-item')).toBe('oculus');
  fireEvent.click(screen.getByRole('button', { name: 'Сбросить порядок ↺' }));
  expect(screen.getAllByRole('listitem')[0].getAttribute('data-grid-item')).toBe('clock');
});

test('legacy widget order keeps all original tiles when clocks are added', () => {
  const legacy = ['details', 'delivery', 'testing', 'data', 'logic', 'interface'];
  expect(restoreOrder(legacy)).toEqual([
    'clock',
    'ouroboros',
    'speculum',
    'opus',
    'codex',
    'oculus',
  ]);
  expect(restoreOrder(['clock', ...legacy])).toEqual([
    'clock',
    'ouroboros',
    'speculum',
    'opus',
    'codex',
    'oculus',
  ]);
  expect(restoreOrder(['clock', 'clock'])).toEqual(defaultOrder);
});

test('oculus reveals its record only after sustained interaction and cleans up timers', () => {
  jest.useFakeTimers();
  const { unmount } = render(<Oculus />);
  const eye = screen.getByRole('button', { name: 'Oculus — Всевидящее око' });
  fireEvent.keyDown(eye, { key: 'Enter' });
  act(() => {
    jest.advanceTimersByTime(2999);
  });
  expect(screen.queryByText('B / 01')).toBeNull();
  fireEvent.keyUp(eye, { key: 'Enter' });
  act(() => {
    jest.advanceTimersByTime(10);
  });
  expect(screen.queryByText('B / 01')).toBeNull();
  fireEvent.keyDown(eye, { key: 'Enter' });
  act(() => {
    jest.advanceTimersByTime(3000);
  });
  expect(screen.getByText('B / 01')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть запись' }));
  expect(screen.queryByText('B / 01')).toBeNull();
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});

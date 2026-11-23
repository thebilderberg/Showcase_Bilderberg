import React from 'react';
import { render } from '@testing-library/react';
import { useTelegram } from './webapp';
function Fixture() {
  useTelegram('home', () => {});
  return null;
}
afterEach(() => {
  delete window.Telegram;
});
function app(version = true) {
  return {
    initData: 'test',
    ready: jest.fn(),
    expand: jest.fn(),
    isVersionAtLeast: jest.fn(() => version),
    disableVerticalSwipes: jest.fn(),
    setHeaderColor: jest.fn(),
    setBackgroundColor: jest.fn(),
    openLink: jest.fn(),
    openTelegramLink: jest.fn(),
    BackButton: { show: jest.fn(), hide: jest.fn(), onClick: jest.fn(), offClick: jest.fn() },
  };
}
test('Telegram app expands and disables content dismissal swipes on supported clients', () => {
  const sdk = app();
  window.Telegram = { WebApp: sdk };
  render(<Fixture />);
  expect(sdk.ready).toHaveBeenCalledTimes(1);
  expect(sdk.expand).toHaveBeenCalledTimes(1);
  expect(sdk.isVersionAtLeast).toHaveBeenCalledWith('7.7');
  expect(sdk.disableVerticalSwipes).toHaveBeenCalledTimes(1);
});
test('older Telegram clients and ordinary browsers remain supported', () => {
  const sdk = app(false);
  window.Telegram = { WebApp: sdk };
  const view = render(<Fixture />);
  expect(sdk.disableVerticalSwipes).not.toHaveBeenCalled();
  view.unmount();
  delete window.Telegram;
  render(<Fixture />);
});

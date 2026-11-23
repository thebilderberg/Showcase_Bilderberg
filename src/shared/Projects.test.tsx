import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Projects } from './Projects';
test('projects link to published sites and expand details', () => {
  render(<Projects />);
  expect(screen.getByText('Perspectiva')).toBeTruthy();
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  const links = screen.getAllByRole('button', { name: 'Открыть сайт ↗' });
  fireEvent.click(links[0]);
  expect(open).toHaveBeenLastCalledWith(
    'https://perspectiva-service.ru/',
    '_blank',
    'noopener,noreferrer',
  );
  fireEvent.click(links[1]);
  expect(open).toHaveBeenLastCalledWith(
    'https://victoria-evgeniy.ru/',
    '_blank',
    'noopener,noreferrer',
  );
  open.mockRestore();
  const details = screen.getAllByRole('button', { name: 'Что внутри проекта +' });
  fireEvent.click(details[0]);
  expect(screen.getByText('Прокрутка управляет этапами реставрации автомобиля.')).toBeTruthy();
  expect(details[0].getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(details[0]);
  expect(screen.queryByText('Прокрутка управляет этапами реставрации автомобиля.')).toBeNull();
});

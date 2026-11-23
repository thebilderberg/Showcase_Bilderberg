export type RouteKey = 'home' | 'projects' | 'widgets' | 'bio';
export const navigationItems: { key: RouteKey; label: string }[] = [
  { key: 'home', label: 'Таро' },
  { key: 'projects', label: 'Проекты' },
  { key: 'widgets', label: 'Виджеты' },
  { key: 'bio', label: 'Обо мне' },
];

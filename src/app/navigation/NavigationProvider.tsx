import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { RouteKey } from './types';
const routes: RouteKey[] = ['home', 'projects', 'widgets', 'bio'];
const readRoute = (): RouteKey => {
  const raw = window.location.hash.split('/')[1];
  const route = (raw === 'clocks' || raw === 'grid' ? 'widgets' : raw) as RouteKey;
  return routes.includes(route) ? route : 'home';
};
type NavContextValue = { route: RouteKey; navigate: (to: RouteKey) => void };
const NavContext = createContext<NavContextValue | null>(null);
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<RouteKey>(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const navigate = useCallback((to: RouteKey) => {
    window.location.hash = to === 'home' ? 'app' : `app/${to}`;
    window.scrollTo(0, 0);
  }, []);
  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
export function useNavigation() {
  const value = useContext(NavContext);
  if (!value) throw Error('NavigationProvider is required');
  return value;
}

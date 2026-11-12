import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { SiteContext } from './SiteContext.js';
import { getSiteSettings, updateSiteSettings } from '../api/site.js';
import { availableThemes, resolveTheme } from '../themes/registry.js';

const initial = { theme_id: 'default', carousel: { enabled: false, interval_ms: 6000, slides: [] } };
const changeKey = 'site-settings-saved';

export default function SiteProvider({ children }) {
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = resolveTheme(settings.theme_id);

  const refresh = useCallback(async () => {
    try { setSettings(await getSiteSettings()); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const focus = () => { if (document.visibilityState === 'visible') refresh(); };
    const storage = (event) => { if (event.key === changeKey) refresh(); };
    window.addEventListener('focus', focus);
    window.addEventListener('storage', storage);
    document.addEventListener('visibilitychange', focus);
    return () => {
      window.removeEventListener('focus', focus);
      window.removeEventListener('storage', storage);
      document.removeEventListener('visibilitychange', focus);
    };
  }, [refresh]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.siteTheme = theme.id;
    const names = Object.keys(theme.variables || {});
    names.forEach((name) => root.style.setProperty(`--site-${name}`, theme.variables[name]));
    return () => {
      names.forEach((name) => root.style.removeProperty(`--site-${name}`));
    };
  }, [theme]);

  const save = async (patch) => {
    const result = await updateSiteSettings(patch);
    setSettings(result);
    try { localStorage.setItem(changeKey, String(Date.now())); } catch { /* Storage can be disabled. */ }
    return result;
  };

  return <SiteContext.Provider value={{ settings, theme, availableThemes, loading, error, save, refresh }}>{children}</SiteContext.Provider>;
}

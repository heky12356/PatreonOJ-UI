import defaultTheme from './default.js';

// Optional local themes remain buildable when the ignored directory is absent.
const localModules = import.meta.glob('./private/*/index.js', { eager: true, import: 'default' });
const themes = [defaultTheme];
for (const theme of Object.values(localModules)) {
  if (theme && /^[a-z][a-z0-9_-]{0,63}$/.test(theme.id) && theme.name && !themes.some((item) => item.id === theme.id)) themes.push(theme);
}
export const availableThemes = themes;
export const resolveTheme = (id) => themes.find((theme) => theme.id === id) || defaultTheme;

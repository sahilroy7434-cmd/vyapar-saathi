export const palette = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  accent: '#22d3ee',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  lightBg: '#f8fafc',
  lightCard: '#ffffff',
  lightText: '#0f172a',
  lightMuted: '#475569',
  darkBg: '#0f172a',
  darkCard: '#1e293b',
  darkText: '#f8fafc',
  darkMuted: '#94a3b8',
  border: '#e2e8f0',
  borderDark: '#334155',
};

export type ThemeMode = 'light' | 'dark';

export function useColors(mode: ThemeMode) {
  const dark = mode === 'dark';
  return {
    bg: dark ? palette.darkBg : palette.lightBg,
    card: dark ? palette.darkCard : palette.lightCard,
    text: dark ? palette.darkText : palette.lightText,
    muted: dark ? palette.darkMuted : palette.lightMuted,
    border: dark ? palette.borderDark : palette.border,
    primary: palette.primary,
    success: palette.success,
    danger: palette.danger,
  };
}

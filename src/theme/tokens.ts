export const THEME_TOKEN_DEFAULTS = {
    '--bg-deep': '#080c18',
    '--accent-cyan': '#3de8ff',
    '--accent-blue': '#2e5bff',
    '--accent-green': '#0ad17a',
    '--accent-purple': '#d138eb',
    '--accent-orange': '#eb8014',
    '--text-primary': '#e8edf7',
    '--text-muted': '#7a849c',
    '--glyph-atlas': '#ffffff',
    '--font-mono': '"JetBrains Mono", "Cascadia Code", ui-monospace, monospace',
} as const;

export type ThemeTokenName = keyof typeof THEME_TOKEN_DEFAULTS;

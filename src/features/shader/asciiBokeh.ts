export const DENSITY = " .,:;'~-!iIl|/\\()[]{}?><+=*czsxtneraohgpmdwqkuvybCQMZW@#&$%";
export const CELL_W = 12;
export const CELL_H = 16;

export interface BokehTheme {
    bgDeep: string;
    textMuted: string;
    accentCyan: string;
    accentBlue: string;
    accentPrimary: string;
    fontMono: string;
}

export type GlRgb = readonly [number, number, number];

export interface GlThemeColors {
    bgDeep: GlRgb;
    textMuted: GlRgb;
    accentCyan: GlRgb;
    accentBlue: GlRgb;
    accentPrimary: GlRgb;
}

const TOKEN_FALLBACKS: Record<string, string> = {
    '--bg-deep': '#080c18',
    '--text-muted': '#7a849c',
    '--accent-cyan': '#3de8ff',
    '--accent-blue': '#2e5bff',
    '--font-mono': '"JetBrains Mono", "Cascadia Code", ui-monospace, monospace',
};

const readToken = (name: keyof typeof TOKEN_FALLBACKS): string => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || TOKEN_FALLBACKS[name];
};

export const readBokehTheme = (): BokehTheme => ({
    bgDeep: readToken('--bg-deep'),
    textMuted: readToken('--text-muted'),
    accentCyan: readToken('--accent-cyan'),
    accentBlue: readToken('--accent-blue'),
    accentPrimary: readToken('--accent-cyan'),
    fontMono: readToken('--font-mono'),
});

const parseColor = (color: string): readonly [number, number, number] => {
    const trimmed = color.trim();

    if (trimmed.startsWith('#')) {
        const h = trimmed.replace('#', '').slice(0, 6);
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
        ] as const;
    }

    const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

    if (rgbMatch) {
        return [
            parseInt(rgbMatch[1], 10),
            parseInt(rgbMatch[2], 10),
            parseInt(rgbMatch[3], 10),
        ] as const;
    }

    return [0, 0, 0] as const;
};

const colorToGlRgb = (color: string): GlRgb => {
    const [r, g, b] = parseColor(color);
    return [r / 255, g / 255, b / 255] as const;
};

export const themeToGlColors = (theme: BokehTheme): GlThemeColors => ({
    bgDeep: colorToGlRgb(theme.bgDeep),
    textMuted: colorToGlRgb(theme.textMuted),
    accentCyan: colorToGlRgb(theme.accentCyan),
    accentBlue: colorToGlRgb(theme.accentBlue),
    accentPrimary: colorToGlRgb(theme.accentPrimary),
});

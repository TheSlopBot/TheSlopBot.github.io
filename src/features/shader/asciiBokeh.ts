import { THEME_TOKEN_DEFAULTS, type ThemeTokenName } from '../../theme/tokens';

export const DENSITY = ' .,:;\'~-!iIl|/\\()[]{}?><+=*czsxtneraohgpmdwqkuvybCQMZW@#&$%';
export const CELL_W = 12;
export const CELL_H = 16;

const BOKEH_TOKEN_NAMES = [
    '--bg-deep',
    '--text-muted',
    '--accent-cyan',
    '--accent-blue',
    '--accent-green',
    '--accent-purple',
    '--accent-orange',
    '--font-mono',
    '--glyph-atlas',
] as const satisfies readonly ThemeTokenName[];

type BokehTokenName = (typeof BOKEH_TOKEN_NAMES)[number];

export interface BokehTheme {
    bgDeep: string;
    textMuted: string;
    accentCyan: string;
    accentBlue: string;
    accentGreen: string;
    accentPurple: string;
    accentOrange: string;
    accentPrimary: string;
    fontMono: string;
    glyphAtlas: string;
}

export type GlRgb = readonly [number, number, number];

export interface GlThemeColors {
    bgDeep: GlRgb;
    textMuted: GlRgb;
    accentCyan: GlRgb;
    accentBlue: GlRgb;
    accentGreen: GlRgb;
    accentPurple: GlRgb;
    accentOrange: GlRgb;
    accentPrimary: GlRgb;
}

const readToken = (name: BokehTokenName): string => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || THEME_TOKEN_DEFAULTS[name];
};

export const readBokehTheme = (): BokehTheme => ({
    bgDeep: readToken('--bg-deep'),
    textMuted: readToken('--text-muted'),
    accentCyan: readToken('--accent-cyan'),
    accentBlue: readToken('--accent-blue'),
    accentGreen: readToken('--accent-green'),
    accentPurple: readToken('--accent-purple'),
    accentOrange: readToken('--accent-orange'),
    accentPrimary: readToken('--accent-cyan'),
    fontMono: readToken('--font-mono'),
    glyphAtlas: readToken('--glyph-atlas'),
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
    accentGreen: colorToGlRgb(theme.accentGreen),
    accentPurple: colorToGlRgb(theme.accentPurple),
    accentOrange: colorToGlRgb(theme.accentOrange),
    accentPrimary: colorToGlRgb(theme.accentPrimary),
});

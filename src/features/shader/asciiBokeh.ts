export const DENSITY = ' .·:;+=*○';
export const CELL_W = 5;
export const CELL_H = 7;

export const BOKEH_ORBS = [
    { radius: 0.28, speed: 0.13, phase: 0, orbit: 0.38, drift: 0.24 },
    { radius: 0.22, speed: 0.09, phase: 1.4, orbit: 0.32, drift: 0.2 },
    { radius: 0.32, speed: 0.11, phase: 2.6, orbit: 0.42, drift: 0.28 },
    { radius: 0.2, speed: 0.15, phase: 4.1, orbit: 0.28, drift: 0.18 },
    { radius: 0.26, speed: 0.08, phase: 0.8, orbit: 0.36, drift: 0.22 },
    { radius: 0.18, speed: 0.12, phase: 3.2, orbit: 0.3, drift: 0.26 },
    { radius: 0.24, speed: 0.1, phase: 5.0, orbit: 0.34, drift: 0.2 },
] as const;

export interface BokehTheme {
    bgDeep: string;
    textMuted: string;
    accentCyan: string;
    accentBlue: string;
    accentPrimary: string;
    fontMono: string;
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

export const intensityToChar = (intensity: number): string => {
    const adjusted = Math.min(1, 0.2 + intensity * 0.8);
    const index = Math.min(
        DENSITY.length - 1,
        Math.floor(adjusted * DENSITY.length),
    );
    return DENSITY[index] ?? '.';
};

export const blendColor = (low: string, high: string, t: number): string => {
    const [r1, g1, b1] = parseColor(low);
    const [r2, g2, b2] = parseColor(high);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r}, ${g}, ${b})`;
};

export const bokehColor = (theme: BokehTheme, intensity: number): string => {
    const t = Math.pow(intensity, 0.5);

    if (t < 0.35) {
        return blendColor(theme.textMuted, theme.accentCyan, t / 0.35);
    }

    if (t < 0.7) {
        return blendColor(
            theme.accentCyan,
            theme.accentBlue,
            (t - 0.35) / 0.35,
        );
    }

    return blendColor(
        theme.accentBlue,
        theme.accentPrimary,
        (t - 0.7) / 0.3,
    );
};

export const bokehIntensity = (x: number, y: number, time: number): number => {
    let intensity = 0.14;

    for (const orb of BOKEH_ORBS) {
        const cx =
            0.5 +
            orb.orbit * Math.sin(time * orb.speed + orb.phase) +
            orb.drift * Math.cos(time * orb.speed * 0.6 + orb.phase * 1.3);
        const cy =
            0.5 +
            orb.orbit * Math.cos(time * orb.speed * 0.85 + orb.phase * 0.7) +
            orb.drift * Math.sin(time * orb.speed * 0.45 + orb.phase);
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        intensity += orb.radius * Math.exp(-dist2 / 0.014);
    }

    intensity +=
        0.08 *
        Math.sin(x * 16 + time * 0.35) *
        Math.cos(y * 12 - time * 0.28);
    intensity +=
        0.05 * Math.sin(x * 9 - time * 0.18) +
        0.05 * Math.cos(y * 11 + time * 0.22);

    return Math.min(1, Math.max(0, intensity));
};

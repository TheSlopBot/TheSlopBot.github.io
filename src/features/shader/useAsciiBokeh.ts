import { useEffect, useRef, type RefObject } from 'react';
import {
    CELL_H,
    CELL_W,
    bokehColor,
    bokehIntensity,
    intensityToChar,
    readBokehTheme,
} from './asciiBokeh';

export const useAsciiBokeh = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return undefined;

        const ctx = canvas.getContext('2d');

        if (!ctx) return undefined;

        let running = true;
        let start = performance.now();

        const resize = () => {
            const parent = canvas.parentElement;

            if (!parent) return;

            const { width, height } = parent.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (now: number) => {
            if (!running) return;

            const { width, height } = canvas.getBoundingClientRect();

            if (width === 0 || height === 0) {
                frameRef.current = requestAnimationFrame(draw);
                return;
            }

            const theme = readBokehTheme();
            const time = (now - start) / 1000;
            const cols = Math.ceil(width / CELL_W);
            const rows = Math.ceil(height / CELL_H);

            ctx.fillStyle = theme.bgDeep;
            ctx.fillRect(0, 0, width, height);

            ctx.globalAlpha = 0.1;
            ctx.fillStyle = theme.accentCyan;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = theme.accentBlue;
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;

            ctx.font = `6px ${theme.fontMono}`;
            ctx.textBaseline = 'top';

            for (let row = 0; row < rows; row += 1) {
                for (let col = 0; col < cols; col += 1) {
                    const x = (col + 0.5) / cols;
                    const y = (row + 0.5) / rows;
                    const intensity = bokehIntensity(x, y, time);
                    const char = intensityToChar(intensity);

                    ctx.fillStyle = bokehColor(theme, intensity);
                    ctx.globalAlpha = 0.32 + intensity * 0.68;
                    ctx.fillText(char, col * CELL_W, row * CELL_H);
                }
            }

            ctx.globalAlpha = 1;
            frameRef.current = requestAnimationFrame(draw);
        };

        const onVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(frameRef.current);
            } else {
                start = performance.now();
                frameRef.current = requestAnimationFrame(draw);
            }
        };

        resize();
        frameRef.current = requestAnimationFrame(draw);

        const observer = new ResizeObserver(resize);
        observer.observe(canvas.parentElement ?? canvas);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            running = false;
            cancelAnimationFrame(frameRef.current);
            observer.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [canvasRef]);
};

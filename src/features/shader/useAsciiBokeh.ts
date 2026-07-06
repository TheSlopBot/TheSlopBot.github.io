import { useEffect, useRef, type RefObject } from 'react';
import { createAsciiBokehRenderer } from './asciiBokehWebGL';

export const useAsciiBokeh = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return undefined;

        const renderer = createAsciiBokehRenderer(canvas);

        if (!renderer) return undefined;

        let running = true;
        let start = performance.now();

        const resize = () => {
            const parent = canvas.parentElement;

            if (!parent) return;

            const { width, height } = parent.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.resize(width, height, dpr);
        };

        const draw = (now: number) => {
            if (!running) return;

            const { width, height } = canvas.getBoundingClientRect();

            if (width === 0 || height === 0) {
                frameRef.current = requestAnimationFrame(draw);
                return;
            }

            renderer.draw((now - start) / 1000);
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
            renderer.destroy();
        };
    }, [canvasRef]);
};

import { useEffect, useRef, type RefObject } from 'react';
import { createAsciiBokehRenderer } from './asciiBokehWebGL';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MAX_DPR = 2;

export const useAsciiBokeh = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return undefined;

        const renderer = createAsciiBokehRenderer(canvas);

        if (!renderer) return undefined;

        let running = true;
        let animating = false;
        let start = performance.now();
        const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
        let reducedMotion = motionQuery.matches;

        const resize = () => {
            const { width, height } = canvas.getBoundingClientRect();

            if (width === 0 || height === 0) return;

            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            renderer.resize(width, height, dpr);
        };

        const draw = (now: number) => {
            if (!running) return;

            renderer.draw(reducedMotion ? 0 : (now - start) / 1000);

            if (!reducedMotion) {
                frameRef.current = requestAnimationFrame(draw);
            } else {
                animating = false;
            }
        };

        const startLoop = () => {
            if (!running || animating) return;

            if (reducedMotion) {
                draw(performance.now());
                return;
            }

            animating = true;
            start = performance.now();
            frameRef.current = requestAnimationFrame(draw);
        };

        const stopLoop = () => {
            animating = false;
            cancelAnimationFrame(frameRef.current);
        };

        const onVisibility = () => {
            if (document.hidden) {
                stopLoop();
            } else {
                startLoop();
            }
        };

        const onMotionPreference = (event: MediaQueryListEvent) => {
            reducedMotion = event.matches;
            stopLoop();
            startLoop();
        };

        resize();
        startLoop();

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        document.addEventListener('visibilitychange', onVisibility);
        motionQuery.addEventListener('change', onMotionPreference);

        return () => {
            running = false;
            stopLoop();
            observer.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            motionQuery.removeEventListener('change', onMotionPreference);
            renderer.destroy();
        };
    }, [canvasRef]);
};

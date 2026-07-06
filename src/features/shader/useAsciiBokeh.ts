import { useEffect, useRef, type RefObject } from 'react';
import { createAsciiBokehRenderer } from './asciiBokehWebGL';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MAX_DPR = 2;
const BOOTSTRAP_FRAME_COUNT = 12;

interface CanvasSize {
    width: number;
    height: number;
}

const readCanvasSize = (canvas: HTMLCanvasElement): CanvasSize => {
    const { width: rectWidth, height: rectHeight } = canvas.getBoundingClientRect();
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    return {
        width: Math.round(Math.max(rectWidth, viewportWidth)),
        height: Math.round(Math.max(rectHeight, viewportHeight)),
    };
};

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
        let bootstrapFrames = BOOTSTRAP_FRAME_COUNT;
        let lastWidth = 0;
        let lastHeight = 0;
        const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
        let reducedMotion = motionQuery.matches;

        const resize = () => {
            const { width, height } = readCanvasSize(canvas);

            if (width === 0 || height === 0) return;

            if (width === lastWidth && height === lastHeight) return;

            lastWidth = width;
            lastHeight = height;

            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            renderer.resize(width, height, dpr);
        };

        const draw = (now: number) => {
            if (!running) return;

            if (bootstrapFrames > 0) {
                bootstrapFrames -= 1;
                resize();
            }

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
            bootstrapFrames = BOOTSTRAP_FRAME_COUNT;
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
                bootstrapFrames = BOOTSTRAP_FRAME_COUNT;
                resize();
                startLoop();
            }
        };

        const onMotionPreference = (event: MediaQueryListEvent) => {
            reducedMotion = event.matches;
            stopLoop();
            startLoop();
        };

        const scheduleInitialResize = () => {
            requestAnimationFrame(() => {
                resize();

                requestAnimationFrame(() => {
                    resize();
                    startLoop();
                });
            });
        };

        scheduleInitialResize();

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        window.addEventListener('resize', resize);
        window.visualViewport?.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', onVisibility);
        motionQuery.addEventListener('change', onMotionPreference);

        return () => {
            running = false;
            stopLoop();
            observer.disconnect();
            window.removeEventListener('resize', resize);
            window.visualViewport?.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVisibility);
            motionQuery.removeEventListener('change', onMotionPreference);
            renderer.destroy();
        };
    }, [canvasRef]);
};

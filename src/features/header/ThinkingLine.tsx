import { useEffect, useState } from 'react';

const THINKING_STEPS = ['thinking', 'thinking.', 'thinking..', 'thinking...'] as const;

const ThinkingLine = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const stepTimer = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
        }, 1200);

        return () => clearInterval(stepTimer);
    }, []);

    useEffect(() => {
        const cursorTimer = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 530);

        return () => clearInterval(cursorTimer);
    }, []);

    const cursorClassName = cursorVisible
        ? 'thinking-line__cursor'
        : 'thinking-line__cursor thinking-line__cursor--hidden';

    return (
        <span className="thinking-line">
            {THINKING_STEPS[stepIndex]}
            <span className={cursorClassName}>█</span>
        </span>
    );
};

export default ThinkingLine;

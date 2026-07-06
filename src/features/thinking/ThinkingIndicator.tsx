import './ThinkingIndicator.css';

const FACE_COUNT = 6;

const ThinkingIndicator = () => (
    <span className="thinking-indicator-group" role="status" aria-label="Thinking">
        <h2 className="thinking-indicator-group__label">thinking</h2>
        <span className="thinking-indicator" aria-hidden="true">
            {Array.from({ length: FACE_COUNT }, (_, index) => (
                <span key={index} className="thinking-indicator__face" />
            ))}
        </span>
    </span>
);

export default ThinkingIndicator;

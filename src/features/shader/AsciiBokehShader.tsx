import { useRef } from 'react';
import { useAsciiBokeh } from './useAsciiBokeh';
import './AsciiBokehShader.css';

const AsciiBokehShader = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useAsciiBokeh(canvasRef);

    return <canvas ref={canvasRef} className="ascii-bokeh-shader" aria-hidden />;
};

export default AsciiBokehShader;

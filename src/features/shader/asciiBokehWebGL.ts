import {
    CELL_H,
    CELL_W,
    DENSITY,
    readBokehTheme,
    themeToGlColors,
    type GlThemeColors,
} from './asciiBokeh';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './asciiBokehShaders';

const FULLSCREEN_TRIANGLE = new Float32Array([
    -1, -1,
    3, -1,
    -1, 3,
]);

const compileShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string,
): WebGLShader => {
    const shader = gl.createShader(type);

    if (!shader) {
        throw new Error('Failed to create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader) ?? 'unknown error';
        gl.deleteShader(shader);
        throw new Error(`Shader compile failed: ${log}`);
    }

    return shader;
};

const createProgram = (gl: WebGLRenderingContext): WebGLProgram => {
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!program) {
        throw new Error('Failed to create WebGL program');
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program) ?? 'unknown error';
        gl.deleteProgram(program);
        throw new Error(`Program link failed: ${log}`);
    }

    return program;
};

const createGlyphAtlas = (font: string, fillColor: string): HTMLCanvasElement => {
    const glyphW = 18;
    const glyphH = 22;
    const atlas = document.createElement('canvas');
    atlas.width = DENSITY.length * glyphW;
    atlas.height = glyphH;

    const ctx = atlas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to create glyph atlas');
    }

    ctx.clearRect(0, 0, atlas.width, atlas.height);
    ctx.fillStyle = fillColor;
    ctx.font = `${glyphH - 2}px ${font}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (let i = 0; i < DENSITY.length; i += 1) {
        ctx.fillText(DENSITY[i] ?? '.', i * glyphW + glyphW / 2, glyphH / 2);
    }

    return atlas;
};

const destroyGlResources = (
    gl: WebGLRenderingContext,
    resources: {
        program: WebGLProgram;
        positionBuffer: WebGLBuffer | null;
        glyphTexture: WebGLTexture | null;
    },
): void => {
    if (resources.glyphTexture) gl.deleteTexture(resources.glyphTexture);
    if (resources.positionBuffer) gl.deleteBuffer(resources.positionBuffer);
    gl.deleteProgram(resources.program);
};

export interface AsciiBokehRenderer {
    resize(cssWidth: number, cssHeight: number, dpr: number): void;
    draw(time: number): void;
    destroy(): void;
}

export const createAsciiBokehRenderer = (
    canvas: HTMLCanvasElement,
): AsciiBokehRenderer | null => {
    const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
    });

    if (!gl) return null;

    const program = createProgram(gl);
    const positionBuffer = gl.createBuffer();
    const initialTheme = readBokehTheme();
    const glyphAtlasCanvas = createGlyphAtlas(initialTheme.fontMono, initialTheme.glyphAtlas);
    const glyphTexture = gl.createTexture();

    if (!positionBuffer || !glyphTexture) {
        destroyGlResources(gl, { program, positionBuffer, glyphTexture });
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);

    gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        glyphAtlasCanvas,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const attribs = {
        position: gl.getAttribLocation(program, 'a_position'),
    };

    const uniforms = {
        time: gl.getUniformLocation(program, 'u_time'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        dpr: gl.getUniformLocation(program, 'u_dpr'),
        cellSize: gl.getUniformLocation(program, 'u_cellSize'),
        glyphCount: gl.getUniformLocation(program, 'u_glyphCount'),
        bgDeep: gl.getUniformLocation(program, 'u_bgDeep'),
        textMuted: gl.getUniformLocation(program, 'u_textMuted'),
        accentCyan: gl.getUniformLocation(program, 'u_accentCyan'),
        accentBlue: gl.getUniformLocation(program, 'u_accentBlue'),
        accentPrimary: gl.getUniformLocation(program, 'u_accentPrimary'),
        accentGreen: gl.getUniformLocation(program, 'u_accentGreen'),
        accentPurple: gl.getUniformLocation(program, 'u_accentPurple'),
        accentOrange: gl.getUniformLocation(program, 'u_accentOrange'),
        glyphAtlas: gl.getUniformLocation(program, 'u_glyphAtlas'),
    };

    let cssWidth = 0;
    let cssHeight = 0;
    let themeColors: GlThemeColors = themeToGlColors(initialTheme);

    const applyTheme = (colors: GlThemeColors) => {
        gl.useProgram(program);
        gl.uniform3fv(uniforms.bgDeep, colors.bgDeep);
        gl.uniform3fv(uniforms.textMuted, colors.textMuted);
        gl.uniform3fv(uniforms.accentCyan, colors.accentCyan);
        gl.uniform3fv(uniforms.accentBlue, colors.accentBlue);
        gl.uniform3fv(uniforms.accentPrimary, colors.accentPrimary);
        gl.uniform3fv(uniforms.accentGreen, colors.accentGreen);
        gl.uniform3fv(uniforms.accentPurple, colors.accentPurple);
        gl.uniform3fv(uniforms.accentOrange, colors.accentOrange);
    };

    applyTheme(themeColors);

    gl.useProgram(program);
    gl.uniform1f(uniforms.glyphCount, DENSITY.length);
    gl.uniform2f(uniforms.cellSize, CELL_W, CELL_H);
    gl.uniform1i(uniforms.glyphAtlas, 0);

    return {
        resize(width, height, dpr) {
            cssWidth = width;
            cssHeight = height;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(program);
            gl.uniform2f(uniforms.resolution, width, height);
            gl.uniform1f(uniforms.dpr, dpr);
            themeColors = themeToGlColors(readBokehTheme());
            applyTheme(themeColors);
        },

        draw(time) {
            if (cssWidth === 0 || cssHeight === 0) return;

            gl.useProgram(program);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
            gl.uniform1f(uniforms.time, time);

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.enableVertexAttribArray(attribs.position);
            gl.vertexAttribPointer(attribs.position, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        },

        destroy() {
            destroyGlResources(gl, { program, positionBuffer, glyphTexture });
        },
    };
};

const video = document.getElementById("camera-video");
const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");

const ascii_canv = document.getElementById("ascii-canvas");
const ascii_c = ascii_canv.getContext("2d");

const ROWS = 50;
const WIDTH_TO_HEIGHT = 0.7;

function cols(c) {
    // x / width = y / height
    // y = height * x / (width / ratio)
    return c.canvas.height * ROWS * WIDTH_TO_HEIGHT / c.canvas.height;
}

function letterDims(c) {
    return { x: c.canvas.width / ROWS, y: c.canvas.height / cols(c) };
}

async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error("Error fetching the camera");
    }
}

function updateCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ascii_canv.width = window.innerWidth;
    ascii_canv.height = window.innerHeight;
    ascii_canv.style.width = `${window.innerWidth}px`;
    ascii_canv.style.height = `${window.innerHeight}px`;

    c.drawImage(video, 0, 0, canvas.width, canvas.height);
}

function atPixel(x, y) {
    return c.getImageData(x, y, 1, 1).data;
}

function atAscii(x, y) {
    const DIMS = letterDims(c);

    const xp = (ROWS - (x + 0.5)) * DIMS.x;
    const yp = (y + 0.5) * DIMS.y;

    return atPixel(xp, yp);
}

function calculateBrightness(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function update() {
    updateCanvas();

    const register = document.getElementById("ascii-register");
    register.innerHTML = "";

    const COLS = cols(c);
    const DIMS = letterDims(c);

    register.style.fontSize = `${DIMS.x}px`;

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const data = atAscii(i, j);

            const r = data[0];
            const g = data[1];
            const b = data[2];

            const brightness = calculateBrightness(r, g, b);

            const x1 = i * DIMS.x;
            const y1 = j * DIMS.y;

            ascii_c.fillStyle = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
            ascii_c.fillRect(x1, y1, DIMS.x, DIMS.y);

            const value = document.createElement("span");
            value.style = `
                position: absolute;
                left: ${x1}px;
                top: ${y1}px;
                width: ${DIMS.x}px;
                height: ${DIMS.y}px;
                font-size: inherit;
                display: flex;
                justify-content: center;
                align-items: center;
            `
            const brightnessChar = 10 - Math.floor(brightness / 255 * 10);
            const brightnessScale = " .:-=+*%@#".charAt(brightnessChar);
            value.innerHTML = brightnessScale;
            register.appendChild(value);
        }
    }
    requestAnimationFrame(update);
}

await init();
update();


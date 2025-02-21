const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const resultCanvas = document.getElementById('resultCanvas');
const captureButton = document.getElementById('capture');
const uploadInput = document.getElementById('upload');
const logoUploadInput = document.getElementById('logoUpload');
const resolutionSelect = document.getElementById('resolution');
const downloadButton = document.getElementById('download');
const ctx = canvas.getContext('2d');
const resultCtx = resultCanvas.getContext('2d');

let cvReady = false;
let logoImage = null;

cv['onRuntimeInitialized'] = () => {
    console.log('OpenCV.js is ready');
    cvReady = true;
};

// Set canvas size based on resolution
function setCanvasSize(ratio) {
    const [widthRatio, heightRatio] = ratio.split(':').map(Number);
    const baseWidth = 640;
    resultCanvas.width = baseWidth;
    resultCanvas.height = (baseWidth * heightRatio) / widthRatio;
    canvas.width = baseWidth;
    canvas.height = (baseWidth * heightRatio) / widthRatio;
}

// Process image with logo and watermark
function processImage(sourceCanvas) {
    if (!cvReady) {
        console.error('OpenCV.js not ready');
        return;
    }
    try {
        let src = cv.imread(sourceCanvas);
        let gray = new cv.Mat();
        let edges = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.Canny(gray, edges, 75, 200);
        let inverted = new cv.Mat();
        cv.bitwise_not(edges, inverted);

        // Display on result canvas
        cv.imshow('resultCanvas', inverted);

        // Add "NJ" watermark
        resultCtx.font = '50px Arial';
        resultCtx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Subtle white
        resultCtx.textAlign = 'center';
        resultCtx.fillText('NJ', resultCanvas.width / 2, resultCanvas.height / 2);

        // Add logo if uploaded
        if (logoImage) {
            const logoSize = 100; // Fixed size for logo
            resultCtx.drawImage(logoImage, 10, 10, logoSize, logoSize);
        }

        src.delete();
        gray.delete();
        edges.delete();
        inverted.delete();
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

// Webcam setup
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error('Error accessing webcam:', err));

// Capture button
captureButton.addEventListener('click', () => {
    setCanvasSize(resolutionSelect.value);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    processImage(canvas);
});

// Upload photo
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const img = new Image();
    img.onload = () => {
        setCanvasSize(resolutionSelect.value);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        processImage(canvas);
    };
    img.src = URL.createObjectURL(file);
});

// Upload logo
logoUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    logoImage = new Image();
    logoImage.onload = () => console.log('Logo loaded');
    logoImage.src = URL.createObjectURL(file);
});

// Resolution change
resolutionSelect.addEventListener('change', () => {
    setCanvasSize(resolutionSelect.value);
    if (canvas.toDataURL() !== resultCanvas.toDataURL()) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        processImage(canvas);
    }
});

// Download result
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'line-drawing.png';
    link.href = resultCanvas.toDataURL('image/png');
    link.click();
});
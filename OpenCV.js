let cvReady = false;
cv['onRuntimeInitialized'] = () => {
    console.log('OpenCV.js is ready');
    cvReady = true;
};

function processImage(sourceCanvas) {
    if (!cvReady) {
        console.error('OpenCV.js not ready yet. Please wait.');
        return;
    }
    let src = cv.imread(sourceCanvas);
    // ... rest of the function
}
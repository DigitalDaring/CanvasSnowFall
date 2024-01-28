let start, previousTimeStamp;

const wipeTheCanvasClean = (context) => {
    context.fillStyle = 'rgba(0,0,0, 255)';
    context.fillRect(0, 0, 2000, 900);
}

const drawText = (context, text, x, y) => {
    context.fillStyle = `rgba(255,255,255,255)`;
    context.font = '30px Roboto';
    context.fillText(text, x, y);
}

const snowGrid = [];

const setupSnowGrid = () => {

};

const setTheScene = () => {
    const canvas = document.getElementById('snow-canvas');
    const context = canvas.getContext('2d');

    const renderAFrame = (timeStamp) => {
        if (start === undefined) {
            start = timeStamp;
        }

        const frameDifference = timeStamp - previousTimeStamp;

        wipeTheCanvasClean(context);

        drawText(context, `${frameDifference}`, 100, 100);

        // we have finished working during this timestamp.
        previousTimeStamp = timeStamp;
        // after each frame render, ask for the next
        window.requestAnimationFrame(renderAFrame);
    }

    // request the first frame render
    window.requestAnimationFrame(renderAFrame); 
}

window.onload = setTheScene;
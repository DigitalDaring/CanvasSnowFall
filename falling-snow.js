let start, previousTimeStamp;

const flipCoin = () => Math.round(Math.random());

const wipeTheCanvasClean = (context) => {
    context.fillStyle = 'rgba(0,0,0, 255)';
    context.fillRect(0, 0, 2000, 900);
};

const drawText = (context, text, x, y) => {
    context.fillStyle = `rgba(255,255,255,255)`;
    context.font = '30px Roboto';
    context.fillText(text, x, y);
};

const drawSquare = (context, x, y, width, brightness) => {
    context.fillStyle = `rgba(${brightness},${brightness},${brightness},255)`;
    context.fillRect(x, y, width, width);
};

// this is really only for debugging atm
const drawSquareOutline = (context, x, y, width) => {
    context.strokeStyle = `rgba(255,255,255,255)`;
    context.strokeRect(x, y, width, width);
};

const maxRows = 160;
const maxColumns = 80;
const cellSize = 5; // square pizel size per cell
const fallEveryFrameAmount = 50;
let currentFrameProgress = 0;

let snowDarkness = 255;
const maxSnowDarkness = 200;
const darknessPerDrop = 1;

const doSomethingForEveryCell = (theGrid, theThing) => {
    for (let x = 0; x < maxColumns; x++) {
        for (let y = 0; y < maxRows; y++) {
            theThing(x, y, theGrid[x][y]);
        }
    }
};

const spawnRandomSnowAtTop = () => {
    for (let x = 0; x < maxColumns; x++) {
        const gonnaBeSnow = flipCoin() + flipCoin() + flipCoin() + flipCoin();
        if (gonnaBeSnow === 4) {
            snowGrid[x][0] = 1;
        }
    }
}

const getBlankSnowGrid = () => {
    const columns = [];

    for (let x = 0; x < maxColumns; x++) {
        const rows = [];
        for (let y = 0; y < maxRows; y++) {
            rows.push(0);
        }
        columns.push(rows);
    }

    return [...columns];
};

let queuedClicks = [];

const blankSnowGrid = getBlankSnowGrid();
let snowGrid = getBlankSnowGrid();

const renderSnowGrid = (context, fullGrid) => {
    snowDarkness = 255;
    doSomethingForEveryCell(fullGrid, (x, y, cell) => {
        if (cell === 1) { 
            drawSquare(context, x * cellSize, y * cellSize, cellSize, snowDarkness);
        } else {
            // disabled, we no longer need this grid for debugging.
            //drawSquareOutline(context, x * cellSize, y * cellSize, cellSize);
        }
    });
};

const letSnowFallIntoNewGrid = (startGrid) => {
    const blankGrid = getBlankSnowGrid();
    doSomethingForEveryCell(startGrid, (x, y, cell) => {
        const isSlideToLeft = flipCoin();
        if (cell === 1 && y + 1 < maxRows && startGrid[x][y+1] !== 1) {
            blankGrid[x][y+1] = 1;
        } else if (cell === 1 && y + 1 < maxRows && startGrid[x][y+1] === 1) {

            // if we might slide to the left AND the cell left and down from us is free...
            if (isSlideToLeft && x > 0 && startGrid[x - 1][y + 1] === 0) {
                blankGrid[x - 1][y + 1] = 1;
            } else if (x < maxColumns - 1 && startGrid[x + 1][y +1] === 0) {
                blankGrid[x + 1][y + 1] = 1;
            } else {
                blankGrid[x][y] = 1;
            }

        } else if (cell === 1 && y + 1 >= maxRows) {
            blankGrid[x][maxRows -1] = 1;
        }
    });
    return [...blankGrid];
};

const onClickedInCanvas = ({offsetX, offsetY}) => {
    const xCell = Math.floor(offsetX / cellSize);
    const yCell = Math.floor(offsetY / cellSize);

    queuedClicks.push({x: xCell, y: yCell});
};

const setTheScene = () => {
    const canvas = document.getElementById('snow-canvas');
    const context = canvas.getContext('2d');


    const renderAFrame = (timeStamp) => {
        if (start === undefined) {
            start = timeStamp;
        }

        frameDifference = timeStamp - previousTimeStamp;
        if (!isNaN(frameDifference)) {
            currentFrameProgress += frameDifference;
        }

        if (currentFrameProgress > fallEveryFrameAmount) {
            currentFrameProgress -= fallEveryFrameAmount;
            queuedClicks.forEach(click => {
                snowGrid[click.x][click.y] = 1;
            });
            queuedClicks = [];
            wipeTheCanvasClean(context);
            spawnRandomSnowAtTop();
    
            //drawText(context, `${frameDifference}`, 100, 100);
            const nextSnowGrid = letSnowFallIntoNewGrid(snowGrid);
            renderSnowGrid(context, nextSnowGrid);
            snowGrid = [...nextSnowGrid];
        }

        // we have finished working during this timestamp.
        previousTimeStamp = timeStamp;
        // after each frame render, ask for the next
        window.requestAnimationFrame(renderAFrame);
    }

    // request the first frame render
    window.requestAnimationFrame(renderAFrame); 

    // add an event for whenever the user clicks on the canvas.
    
    canvas.addEventListener('click', onClickedInCanvas);
    canvas.addEventListener('mousemove', onClickedInCanvas);
};

window.onload = setTheScene;
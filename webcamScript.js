const video = document.getElementById('video');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');
let appearElement = document.getElementById('appear');
let start = Date.now();
let expressionCollection = [];
let numDetections = 0;
let count = 0;
let index = 0;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        (stream) => (video.srcObject = stream),
        (err) => console.error(err)
    );
}

let n = 100;
let x = [];
let y = [];
let updatedData = [];
const expr = [
    'happy',
    'neutral',
    'surprised',
    'sad',
    'angry',
    'fearful',
    'disgusted',
];
const series = [];
for (i = 0; i < expr.length; i++) {
    series[i] = [];
}

for (i = 0; i < n; i++) {
    x[i] = i + 1;
    y[i] = 0;
    series.forEach((element) => {
        element[i] = 0;
    });
}

let data = [];
for (let i = 0; i < series.length; i++) {
    data[i] = {
        x: x,
        y: series[i],
        stackgroup: 'one',
        legendgroup: expr[i],
        name: expr[i],
    };
}
let layout = {
    title: 'Coloring Your Expression...',
    showlegend: true,
    yaxis: { range: [0, 1] },
};

Plotly.newPlot(TESTER, data, layout);

video.addEventListener('play', () => {

    // add field name to enable document query
    firebase
        .firestore()
        .collection('Webcam')
        .doc(start.toString())
        .set({ name: start.toString() })
        .then(() => console.log('added'))
        .catch((error) => console.warn(error));

    const canvas = faceapi.createCanvasFromMedia(video);
    if (!document.getElementById('vidCanvas')) {
        canvas.id = 'vidCanvas';
        canvasDiv.insertBefore(canvas, canvasDiv.childNodes[1]);
    } else {
        canvas = document.getElementById('vidCanvas');
    }
    const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        function update() {
            let cum = 0;
            index++;
            for (let i = 0; i < series.length; i++) {
                cum += detections.expressions[expr[i]];
                series[i].push(cum);
                series[i].shift();
            }
            for (let i = 0; i < series.length; i++) {
                updatedData[i] = { y: series[i] };
            }
            Plotly.animate(
                TESTER,
                {
                    data: updatedData,
                },
                {
                    transition: {
                        duration: 0,
                    },
                    frame: {
                        duration: 0,
                        redraw: false,
                    },
                }
            );
            firebaseUpdate(detections);
        }
        if (detections != undefined) {
            requestAnimationFrame(update);
            console.log('detection updated');
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        } else {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            console.log('detections is undefined ');
        }
    }, 100); //0.1 second per frame
});

// write to firestore database
var firebaseUpdate = async function (detections) {

    let expressions = detections.expressions;

    // index of the emotion with the largest probability
    let repExp = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
    );
    appearElement.innerHTML = 'You appear to be ' + repExp;

    expressions.timeFrame = (Date.now() - start) / 1000;
    expressionCollection.push(JSON.stringify(expressions));
    numDetections++;

    //Firebase module

    //send the extracted info and initialize the arrays for every 10 frame
    if (index % 10 == 0) {
        await sendStuffToFirebase();
        count++;
        expressionCollection = [];
    }
    //Firebase module ends
}

var sendStuffToFirebase = async () => {

    objectToPush = {
        name: start.toString(),
        detections: expressionCollection,
        numDetections: numDetections,
    };
    // Pushes video name, expression data, number of frames, time stamps for each frame (and landmarks)
    await firebase
        .firestore()
        .collection('Webcam')
        .doc(start.toString())
        .collection(count.toString())
        .doc('data')
        .set(objectToPush)
        .then(() => console.log('Saved to DB at frame ' + numDetections))
        .catch((error) => {
            console.warn(error);
        });
}
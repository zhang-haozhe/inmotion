const video = document.getElementById('video');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
	navigator.getUserMedia(
		{ video: {} },
		stream => (video.srcObject = stream),
		err => console.error(err)
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
	'disgusted'
];
const series = [];
for (i = 0; i < expr.length; i++) {
	series[i] = [];
}

for (i = 0; i < n; i++) {
	x[i] = i + 1;
	y[i] = 0;
	series.forEach(element => {
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
		name: expr[i]
	};
}
let layout = {
	title: 'Emotion Real-time Diagram',
	showlegend: true,
	yaxis: { range: [0, 1] }
};

Plotly.newPlot(TESTER, data, layout);

video.addEventListener('play', () => {
	let canvas = faceapi.createCanvasFromMedia(video);
	if (!document.getElementById('vidCanvas')) {
		canvas.id = 'vidCanvas';
		canvasDiv.insertBefore(canvas, canvasDiv.childNodes[1]);
	} else {
		canvas = document.getElementById('vidCanvas');
	}
	const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
	faceapi.matchDimensions(canvas, displaySize);
	detectFrame = () => {
		faceapi
			.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
			.withFaceLandmarks()
			.withFaceExpressions()
			.then(detections => {
				function update() {
					let cum = 0;
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
							data: updatedData
						},
						{
							transition: {
								duration: 0
							},
							frame: {
								duration: 0,
								redraw: false
							}
						}
					);
				}
				if (detections != undefined) {
					requestAnimationFrame(update);
					console.log('detection updated');
					const resizedDetections = faceapi.resizeResults(
						detections,
						displaySize
					);
					canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
					faceapi.draw.drawDetections(canvas, resizedDetections);
					faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
					faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
				} else {
					console.log('detections is undefined ');
				}
				detectFrame();
			}); //0.1 second per frame
	};
	detectFrame();
});

const video = document.getElementById('video');
const videoUpload = document.getElementById('videoUpload');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');
let faceMatcher = null;

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models'),
	faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo);

async function startVideo() {
	let response = JSON.parse(sessionStorage.getItem('descriptor'));

	let val = Object.values(response);
	let newLabeledFaceDescriptors = [];
	await val.forEach(async x => {
		let array = x.descriptors;
		let inputArray = [];
		await array.forEach(element => {
			inputArray.push(new Float32Array(element));
		});
		newLabeledFaceDescriptors.push(
			new faceapi.LabeledFaceDescriptors(x.label, inputArray)
		);
	});
	faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6);
	console.log(1);
	//   navigator.getUserMedia(
	//     { video: {} },
	//     stream => (video.srcObject = stream),
	//     err => console.error(err)
	//   );
}

let videoSelection = new Promise((resolve, reject) => {
	videoUpload.addEventListener('change', () => {
		if (videoUpload) {
			let videoURL = window.URL.createObjectURL(videoUpload.files[0]);
			console.log(2);
			video.setAttribute('src', videoURL);
			setTimeout(() => {
				console.log('video readyState is ' + video.readyState);
				resolve();
			}, 1000);
		}
	});
});

videoSelection.then(() => {
	console.log('videoselection done');
});

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

videoSelection
	.then(() => {
		let canvas = faceapi.createCanvasFromMedia(video);
		if (!document.getElementById('vidCanvas')) {
			canvas.id = 'vidCanvas';
			canvasDiv.insertBefore(canvas, canvasDiv.childNodes[1]);
		} else {
			canvas = document.getElementById('vidCanvas');
		}
		const displaySize = {
			width: video.offsetWidth,
			height: video.offsetHeight
		};
		faceapi.matchDimensions(canvas, displaySize);
		let count = 0;
		let firstPlay = true;
		console.log('only once');

		detectFrame = () => {
			count++;
			console.log('count is ' + count);
			faceapi
				.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
				.withFaceLandmarks()
				.withFaceExpressions()
				.then(detections => {
					if (firstPlay) {
						video.play();
						video.loop = false;
						firstPlay = false;
					}
					console.log('detection success');
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
						canvas
							.getContext('2d')
							.clearRect(0, 0, canvas.width, canvas.height);
						faceapi.draw.drawDetections(canvas, resizedDetections);
						faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
						faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
					} else {
						console.log('detections is undefined ');
					}
					console.log('enter recursion');
					detectFrame();
				})
				.catch(() => {
					debugger;
					console.log('curry');
				}); //0.1 second per frame
			console.log('finish den');
		};
		console.log(3);
		detectFrame();
		console.log(4);
	})
	.catch(error => {
		console.log('caonimade');
		console.log(error);
	});

// Promise.all([gay])
// 	.then(console.log('caonimabi'))
// 	.catch(() => {
// 		console.log('cao');
// 	});

async function compare(detections, displaySize, faceMatcher) {
	const resizedDetections = faceapi.resizeResults(detections, displaySize);
	const results = resizedDetections.map(d =>
		faceMatcher.findBestMatch(d.descriptor)
	);

	let index = 0;
	let dis = 1;
	await results.forEach((result, i) => {
		if (result._distance < dis) {
			dis = result._distance;
			index = i;
		}
	});
	return [index, dis, results[0].label];
}

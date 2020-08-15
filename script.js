const video = document.getElementById('video');
const videoUpload = document.getElementById('videoUpload');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');
// var theUser = document.getElementById('currentUser').value;
let faceMatcher = null;
var expressionCollection = [];
var landmarksCollection = [];
var numDetections = 0;
let count = 0;
var videoName = '';

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models'),
	faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(startVideo);

async function startVideo() {
	let response = JSON.parse(sessionStorage.getItem('descriptor'));

	let val = Object.values(response);
	let newLabeledFaceDescriptors = [];
	await val.forEach(async (x) => {
		let array = x.descriptors;
		let inputArray = [];
		await array.forEach((element) => {
			inputArray.push(new Float32Array(element));
		});
		newLabeledFaceDescriptors.push(
			new faceapi.LabeledFaceDescriptors(x.label, inputArray)
		);
	});
	faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6);
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
				videoName = videoUpload.value.substr(
					videoUpload.value.lastIndexOf('\\') + 1
				);
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
	title: 'Emotion Real-time Diagram',
	showlegend: true,
	yaxis: { range: [0, 1] },
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
			height: video.offsetHeight,
		};
		faceapi.matchDimensions(canvas, displaySize);
		let firstPlay = true;

		detectFrame = () => {
			faceapi
				.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
				.withFaceLandmarks()
				.withFaceExpressions()
				.then((detections) => {
					if (firstPlay) {
						video.play();
						video.loop = false;
						firstPlay = false;
					}
					function update() {
						let cum = 0;
						let positionArray = [];
						let relativePositionArray = [];
						let landMarkObject = {};

						for (let i = 0; i < series.length; i++) {
							cum += detections.expressions[expr[i]];
							series[i].push(cum);
							series[i].shift();

							if (i % 300 == 0) {
								//send the extracted info and initialize the arrays for every 100 frames
								sendStuffToFirebase();
								count++;
								expressionCollection = [];
								positionArray = [];
								relativePositionArray = [];
							}
							expressionCollection.push(
								JSON.stringify({
									neutral: detections.expressions.neutral,
									happy: detections.expressions.happy,
									sad: detections.expressions.sad,
									angry: detections.expressions.angry,
									fearful: detections.expressions.fearful,
									disgusted: detections.expressions.disgusted,
									timeFrame: Date.now(),
								})
							);

							for (let j = 0; j < 68; j++) {
								positionArray.push({
									x: detections.landmarks.positions[j].x,
									y: detections.landmarks.positions[j].y,
								});
								relativePositionArray.push({
									x: detections.landmarks.relativePositions[j].x,
									y: detections.landmarks.relativePositions[j].y,
								});
							}

							landMarkObject = {
								height: detections.landmarks.imageHeight,
								width: detections.landmarks.imageWidth,
								positions: positionArray,
								relativePostions: relativePositionArray,
								shift: {
									x: detections.landmarks.shift.x,
									y: detections.landmarks.shift.y,
								},
							};

							// Everytime one frame is processed, its emotion data and the time for that frame is pushed to the array for pushing to the database

							// Because the original structure of the detections object makes the object itself unable to be passed thru the firebase api,
							// lines below extract the necessary info from the structure.

							// for (const item of Object.entries(detections.landmarks)) {
							//   console.log(item);
							//   for (const subItem of Object.entries(item)) {
							//     // console.log(subItem);
							//   }
							// }
							// expressionCollection.push([
							//   detections.expressions.neutral,
							//   detections.expressions.happy,
							//   detections.expressions.sad,
							//   detections.expressions.angry,
							//   detections.expressions.fearful,
							//   detections.expressions.disgusted,
							// ]);
							// expressionCollection.push(JSON.stringify(detections.expressions));
							// expressionCollection.push(detections.expressions);
							// console.log(detections.landmarks);

							// landmarksCollection.push(JSON.stringify(detections.landmarks));
							landmarksCollection.push(JSON.stringify(landMarkObject));
							numDetections++;

							// detectionCollection += detections;
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
						canvas
							.getContext('2d')
							.clearRect(0, 0, canvas.width, canvas.height);
						console.log('detections is undefined ');
					}
					detectFrame();
				})
				.catch(() => {
					debugger;
					console.log('error');
				}); //0.1 second per frame
		};
		detectFrame();
	})
	.catch((error) => {
		console.log(error);
	});

async function compare(detections, displaySize, faceMatcher) {
	const resizedDetections = faceapi.resizeResults(detections, displaySize);
	const results = resizedDetections.map((d) =>
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

function sendStuffToFirebase() {
	objectToPush = {
		name: videoName,
		detections: expressionCollection,
		numDetections: numDetections,
		// landmarks: landmarksCollection
	};
	// Pushes video name, expression data, number of frames, time stamps for each frame (and landmarks)

	firebase
		.firestore()
		.collection('Landmarks')
		.doc(videoName)
		.collection(count.toString())
		.doc('data')
		.set({
			landmarks: landmarksCollection,
		})
		.then(() => {
			console.log('landmarks saved');
			firebase
				.firestore()
				.collection('Emotion')
				.doc(videoName)
				.collection(count.toString())
				.doc('data')
				.set(objectToPush)
				.then(() => console.log('Saved to DB'))
				.catch((error) => {
					console.warn(error);
				});
		})
		.catch((error) => {
			console.warn(error);
		});
}

// Triggered once the video ends
document.getElementById('video').addEventListener('ended', myHandler, false);
function myHandler(e) {
	// When the vid ends, sends the data of emotions and landmarks to the database
	console.log('video ended');
	sendStuffToFirebase();
}

const video = document.getElementById('video');
const videoUpload = document.getElementById('videoUpload');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');
let appearToBeElement = document.getElementById('appearToBeText');
let faceMatcher = null;
let expressionCollection = [];
let landmarksCollection = [];
let numDetections = 0;
let count = 0;
let videoName = '';
let index = 0;
let start = Date.now();

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models'),
	faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(startVideo);

async function startVideo() {
	return;
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

		// add field name to enable document query
		firebase
			.firestore()
			.collection('Emotion')
			.doc(videoName)
			.set({ name: videoName })
			.then(() => console.log('added'))
			.catch((error) => console.warn(error));

		// method to be looped
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
					console.log('error');
				}); //0.1 second per frame
		};
		// begin inference
		start = Date.now();
		detectFrame();
	})
	.catch((error) => {
		console.warn(error);
	});

// write to firestore database
var firebaseUpdate = function (detections) {
	return new Promise((resolve, reject) => {
		try {
			let expressions = detections.expressions;

			// index of the emotion with the largest probability
			let repExp = Object.keys(expressions).reduce((a, b) =>
				expressions[a] > expressions[b] ? a : b
			);
			appearToBeElement.innerHTML = 'You appear to be ' + repExp;

			expressions.timeFrame = (Date.now() - start) / 1000;
			expressionCollection.push(JSON.stringify(expressions));
			numDetections++;

			//Firebase module

			//send the extracted info and initialize the arrays for every 10 frame
			if (index % 10 == 0) {
				sendStuffToFirebase();
				count++;
				expressionCollection = [];
			}
			//Firebase module ends
		}
		catch (error) {
			reject(error)
		}
		finally {
			resolve("Firebase updated")
		}
	}).catch(error => console.warn(error))

}

var sendStuffToFirebase = () => {
	return new Promise((resolve, reject) => {
		try {
			objectToPush = {
				name: videoName,
				detections: expressionCollection,
				numDetections: numDetections,
			};
			// Pushes video name, expression data, number of frames, time stamps for each frame (and landmarks)
			firebase
				.firestore()
				.collection('Emotion')
				.doc(videoName)
				.collection(count.toString())
				.doc('data')
				.set(objectToPush)
				.then(() => console.log('Saved to DB at frame ' + numDetections))
				.catch((error) => {
					console.warn(error);
				});
		}
		catch (error) {
			reject(error)
		}
		finally {
			resolve("Sent to Firebase")
		}
	}).catch(error => console.warn(error))

}

// Triggered once the video ends
// document.getElementById('video').addEventListener('ended', myHandler, false);
// function myHandler(e) {
//   // When the vid ends, sends the data of emotions and landmarks to the database
//   console.log('video ended');
//   sendStuffToFirebase();
// }

const video = document.getElementById('video');
const videoUpload = document.getElementById('videoUpload');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');
// var theUser = document.getElementById('currentUser').value;
var appearToBeElement = document.getElementById('appearToBeText');
let faceMatcher = null;
var expressionCollection = [];
var landmarksCollection = [];
var numDetections = 0;
let count = 0;
var videoName = '';
var index = 0;

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

            firebaseUpdate(detections);

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

function firebaseUpdate(detections) {
  //Updates the text
  let expressionsArray = [
    detections.expressions.neutral,
    detections.expressions.happy,
    detections.expressions.surprised,
    detections.expressions.sad,
    detections.expressions.angry,
    detections.expressions.fearful,
    detections.expressions.disgusted,
  ];
  let biggestVal = expressionsArray.indexOf(Math.max(...expressionsArray));
  switch (biggestVal) {
    case 0:
      appearToBeElement.innerHTML = 'You appear to be neutral';
      break;
    case 1:
      appearToBeElement.innerHTML = 'You appear to be happy';
      break;
    case 2:
      appearToBeElement.innerHTML = 'You appear to be surprised';
      break;
    case 3:
      appearToBeElement.innerHTML = 'You appear to be sad';
      break;
    case 4:
      appearToBeElement.innerHTML = 'You appear to be angry';
      break;
    case 5:
      appearToBeElement.innerHTML = 'You appear to be fearful';
      break;

    default:
      appearToBeElement.innerHTML = 'You appear to be disgusted';
      break;
  }

  //Firebase module

  //send the extracted info and initialize the arrays for every 100 frames
  if (index % 10 == 0) {
    expressionCollection.push(
      JSON.stringify({
        neutral: detections.expressions.neutral,
        happy: detections.expressions.happy,
        surprised: detections.expressions.surprised,
        sad: detections.expressions.sad,
        angry: detections.expressions.angry,
        fearful: detections.expressions.fearful,
        disgusted: detections.expressions.disgusted,
        timeFrame: Date.now(),
      })
    );
    sendStuffToFirebase();
    count++;
    expressionCollection = [];
    // positionArray = [];
    // relativePositionArray = [];
  }

  expressionCollection.push(
    JSON.stringify({
      neutral: detections.expressions.neutral,
      happy: detections.expressions.happy,
      surprised: detections.expressions.surprised,
      sad: detections.expressions.sad,
      angry: detections.expressions.angry,
      fearful: detections.expressions.fearful,
      disgusted: detections.expressions.disgusted,
      timeFrame: Date.now(),
    })
  );
  numDetections++;

  //Firebase module ends
}

function sendStuffToFirebase() {
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
    .then(() => console.log('Saved to DB'))
    .catch((error) => {
      console.warn(error);
    });
}

// Triggered once the video ends
// document.getElementById('video').addEventListener('ended', myHandler, false);
// function myHandler(e) {
//   // When the vid ends, sends the data of emotions and landmarks to the database
//   console.log('video ended');
//   sendStuffToFirebase();
// }

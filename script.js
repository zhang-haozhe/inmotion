const video = document.getElementById('video');
const TESTER = document.getElementById('tester');

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
let e1 = [],
  e2 = [],
  e3 = [],
  e4 = [],
  e5 = [],
  e6 = [];

for (i = 0; i < n; i++) {
  x[i] = i + 1;
  y[i] = 0;
  (e1[i] = 0), (e2[i] = 0), (e3[i] = 0), (e4[i] = 0), (e5[i] = 0), (e6[i] = 0);
}

var trace1 = {
  x: x,
  y: e1,
  // mode: 'markers',
  stackgroup: 'one'
  // line: {
  //   simplify: false,
  //   color: 'rgb(100, 255, 20)'
  // }
  // marker: {
  //   color: 'rgba(17, 157, 255,0.5)',
  //   size: 20
  //   // line: {
  //   //   color: 'rgb(231, 99, 250)',
  //   //   width: 3
  //   // }
  // }
};

var trace2 = {
  x: x,
  y: e2,
  stackgroup: 'one'
};

var trace3 = {
  x: x,
  y: e3,
  stackgroup: 'one'
};

var trace4 = {
  x: x,
  y: e4,
  stackgroup: 'one'
};

var trace5 = {
  x: x,
  y: e5,
  stackgroup: 'one'
};

var trace6 = {
  x: x,
  y: e6,
  stackgroup: 'one'
};

var data = [trace1, trace2, trace3, trace4, trace5, trace6];
var layout = {
  title: 'Emotion Diagram',
  showlegend: false,
  yaxis: { range: [0, 1] }
};

Plotly.newPlot(TESTER, data, layout);

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.insertBefore(canvas, document.body.childNodes[0]);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    function update() {
      let cum = 0;
      cum += detections.expressions.happy;
      e1 = e1.slice(1, n).concat(cum);
      cum += detections.expressions.neutral;
      e2 = e2.slice(1, n).concat(cum);
      cum += detections.expressions.surprised;
      e3 = e3.slice(1, n).concat(cum);
      cum += detections.expressions.sad;
      e4 = e4.slice(1, n).concat(cum);
      cum += detections.expressions.angry;
      e5 = e5.slice(1, n).concat(cum);
      cum += detections.expressions.fearful;
      e6 = e6.slice(1, n).concat(cum);
      Plotly.animate(
        TESTER,
        {
          data: [
            {
              y: e1
            },
            {
              y: e2
            },
            {
              y: e3
            },
            {
              y: e4
            },
            {
              y: e5
            },
            {
              y: e6
            }
          ]
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
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    } else {
      console.log('detections is undefined ');
    }
  }, 100); //0.1 second per frame
});

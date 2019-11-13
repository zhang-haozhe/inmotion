


const video = document.getElementById('video');
const TESTER = document.getElementById('tester');
const canvasDiv = document.getElementById('canvasDiv');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then();


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
  const canvas = faceapi.createCanvasFromMedia(video);
  canvasDiv.insertBefore(canvas, canvasDiv.childNodes[1]);
  const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces
      (video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();
    //

    start(detections, displaySize)
    if (detections.length != 0) {

    }
    //

    //
    function update() {
      let cum = 0;
      for (let i = 0; i < series.length; i++) {
        cum += detections[0].expressions[expr[i]];
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

    if (detections != undefined || detections.length != 0) {
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











async function start(detections, displaySize) {


  //load
  const response = await fetch('./descriptors.json');
  const myJson = await response.json();
  //    console.log(myJson);

  var newLabeledFaceDescriptors = myJson.map(x => faceapi.LabeledFaceDescriptors.fromJSON(x));
  //    console.log(newLabeledFaceDescriptors);


  const faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6)

  //faceapi.matchDimensions(canvas, displaySize)
  //const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
  const resizedDetections = faceapi.resizeResults(detections, displaySize)
  const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

  // const box = resizedDetections[i].detection.box
  // const drawBox = new faceapi.draw.DrawBox(box, {
  //     label: result.toString()
  // })
  // drawBox.draw(canvas)
  results.forEach((result, i) => {
    console.log(result._distance)
  })

  // })
}

function loadLabeledImages() {
  const labels = ['Black Widow']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 1; i++) {
        const img = await faceapi.fetchImage(`./labeled_images/Black Widow/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {
    type: contentType
  });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

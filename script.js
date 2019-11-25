const video = document.getElementById("video");
const TESTER = document.getElementById("tester");
const canvasDiv = document.getElementById("canvasDiv");
let faceMatcher = null;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

async function startVideo() {
  const response = await fetch("./descriptors.json");
  const myJson = await response.json();

<<<<<<< HEAD
  var newLabeledFaceDescriptors = myJson.map(x => faceapi.LabeledFaceDescriptors.fromJSON(x));
  //    console.log(newLabeledFaceDescriptors);
  faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6)
=======
  var newLabeledFaceDescriptors = myJson.map(x =>
    faceapi.LabeledFaceDescriptors.fromJSON(x)
  );

  //    console.log(newLabeledFaceDescriptors);

  faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6);
>>>>>>> 6e7f6451d8d72bcfbf77fdde6694e31e8df77a8b
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

//faceMatcher
// const response = await fetch('./descriptors.json');
// const myJson = await response.json();

// var newLabeledFaceDescriptors = myJson.map(x => faceapi.LabeledFaceDescriptors.fromJSON(x));

// //    console.log(newLabeledFaceDescriptors);

// const faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6)
//
let n = 100;
let x = [];
let y = [];
let updatedData = [];
const expr = [
  "happy",
  "neutral",
  "surprised",
  "sad",
  "angry",
  "fearful",
  "disgusted"
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
    stackgroup: "one",
    legendgroup: expr[i],
    name: expr[i]
  };
}
let layout = {
  title: "Emotion Real-time Diagram",
  showlegend: true,
  yaxis: { range: [0, 1] }
};

Plotly.newPlot(TESTER, data, layout);

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  canvasDiv.insertBefore(canvas, canvasDiv.childNodes[1]);
  debugger;
  const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();
    //

    //compare(detections, displaySize)


    //

    //
    function update(index) {
      let cum = 0;
      for (let i = 0; i < series.length; i++) {
        cum += detections[index].expressions[expr[i]];
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

    if (detections.length != 0) {
      let index = [];
      if (detections.length > 0) {
        index = await compare(detections, displaySize, faceMatcher);
        console.log("indexUp:", index[0]);
      }

      console.log("index:", index[0]);
      requestAnimationFrame(() => update(index[0]));
      const resizedDetections = faceapi.resizeResults(
        detections[index[0]],
        displaySize
      );
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      const box = resizedDetections.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label:
          index[2] +
          " " +
          index[1].toFixed(2).toString() +
          " Age " +
          detections[0].age.toFixed(0) +
          " Gender " +
          detections[0].gender
      });
      drawBox.draw(canvas);
    } else {
      console.log("detection undefined");
    }
    // if (detections != undefined || detections.length != 0) {
    //   requestAnimationFrame(() => update(index));
    //   console.log('detection updated');
    //   const resizedDetections = faceapi.resizeResults(detections, displaySize);
    //   canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    //   faceapi.draw.drawDetections(canvas, resizedDetections);
    //   faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    //   faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    // } else {
    //   console.log('detections is undefined ');
    // }
  }, 100); //0.1 second per frame
});

async function compare(detections, displaySize, faceMatcher) {
  //load
  // const response = await fetch('./descriptors.json');
  // const myJson = await response.json();

  // var newLabeledFaceDescriptors = myJson.map(x => faceapi.LabeledFaceDescriptors.fromJSON(x));

  // //    console.log(newLabeledFaceDescriptors);

  // const faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6)

  //faceapi.matchDimensions(canvas, displaySize)
  //const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  debugger;
  const results = resizedDetections.map(d =>
    faceMatcher.findBestMatch(d.descriptor)
  );

  // const box = resizedDetections[i].detection.box
  // const drawBox = new faceapi.draw.DrawBox(box, {
  //     label: result.toString()
  // })
  // drawBox.draw(canvas)
  let index = 0;
  let dis = 1;
  await results.forEach((result, i) => {
    if (result._distance < dis) {
      dis = result._distance;
      index = i;
      // console.log("dis:", dis)
    }
<<<<<<< HEAD
  })

  return index;
=======
  });
  return [index, dis, results[0].label];
>>>>>>> 6e7f6451d8d72bcfbf77fdde6694e31e8df77a8b
  // })
}

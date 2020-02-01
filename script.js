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

var token = document.cookie.substring(6);
if (document.cookie) {
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }
}

let myFirstPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    if (token) resolve("token!");
    else {
      alert("You have not logged in.");
      window.location = "http://127.0.0.1:8080/login.html"; //Direct to the login page
    }
  }, 50);
});

myFirstPromise.then(stuff => {
  console.log(token); //FIXME: check if token is valid
});

// let myFirstPromise = new Promise((resolve, reject) => {
//   // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
//   // In this example, we use setTimeout(...) to simulate async code.
//   // In reality, you will probably be using something like XHR or an HTML5 API.
//   setTimeout(function() {
//     if (!token) resolve("Success!"); // Yay! Everything went well!
//   }, 50);
// });

// myFirstPromise.then(successMessage => {
//   // successMessage is whatever we passed in the resolve(...) function above.
//   // It doesn't have to be a string, but if it is only a succeed message, it probably will be.
//   console.log(token);
// });

async function startVideo() {
  // const response = await fetch("./descriptors.json");
  // const myJson = await response.json();
  // console.log(myJson)
  // var newLabeledFaceDescriptors = myJson.map(x =>
  //   faceapi.LabeledFaceDescriptors.fromJSON(x)
  // );
  let response = JSON.parse(sessionStorage.getItem("descriptor"));

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
  // faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6);
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
  const displaySize = { width: video.offsetWidth, height: video.offsetHeight };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    console.log("before", Date());
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptors();
    console.log("after", Date());
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
        //console.log("indexUp:", index[0]);
      }

      // console.log("index:", index[0]);
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
      //
      index[2] = faceMatcher._labeledDescriptors[0].label;
      //
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
  }, 10); //0.1 second per frame
});

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

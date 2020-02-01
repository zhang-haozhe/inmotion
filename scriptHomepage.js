Promise.all([
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(start);

function start() {
  const img = document.getElementById("imageUpload");

  if (img) {
    img.addEventListener("change", async () => {
      console.log("change");
      faceapi.bufferToImage(img.files[0]).then(image => {
        loadLabeledImages(image).then(values => {
          const descriptor = JSON.stringify(values);
          sessionStorage.setItem("descriptor", descriptor);
        });
      });
    });
  }
}

async function loadLabeledImages(image) {
  const labels = ["owner"];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 1; i++) {
        const detections = await faceapi
          .detectSingleFace(image)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

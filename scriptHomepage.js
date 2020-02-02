Promise.all([
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(start);

//////

//Send image
const sendImg = async function(asset) {
  const config = {
    headers: {
      "Content-Type": "application/json"
      //"Content-Type": "application/text"
    }
  };

  const body = JSON.stringify({ image: asset });
  // console.log(body)
  try {
    // const res = await axios
    //   .post("http://localhost:8080/api/img", body, config)
    //   .then(response => {
    //     console.log(response);
    //     // console.log(response.data.token);
    //   });
    const res = await axios
      .post("http://localhost:8080/api/img", body, config)
      .then(response => console.log(response));
  } catch (err) {
    const errors = err.response.data.errors;
    console.log(errors);
  }
};

function encodeImageFile(file) {
  var reader = new FileReader();
  console.log(typeof file);
  reader.onloadend = function() {
    console.log("RESULT", reader.result);
    sendImg(reader.result);
  };
  reader.readAsDataURL(file);
}
///////

function start() {
  const img = document.getElementById("imageUpload");
  //uplaod image
  //
  var token = document.cookie.substring(6);
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    delete axios.defaults.headers.common["x-auth-token"];
  }

  if (img) {
    img.addEventListener("change", async () => {
      console.log("change");
      encodeImageFile(img.files[0]);
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

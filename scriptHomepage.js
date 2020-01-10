

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);


function start() {
    let Descriptor = null;
    const img = document.getElementById('imageUpload');

    // const response = await fetch('example.com', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ example: 'data' }),
    //   })

    if (img) {
        img.addEventListener('change', async () => {
            //console.log(img.files[0])
            const image = await faceapi.bufferToImage(img.files[0]);
            Descriptor = await loadLabeledImages(image);
            console.log(Descriptor)
            axios.post('http://localhost:8080/descriptor', Descriptor)


        })
    }
}


async function loadLabeledImages(image) {
    const labels = ['owner']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 1; i++) {

                const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}


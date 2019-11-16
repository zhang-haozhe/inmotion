

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then();



let Descriptor = null;
const img = document.getElementById('imageUpload');


if (img) {
    img.addEventListener('change', async () => {

        image = await faceapi.bufferToImage(img.files[0])
        Descriptor = loadLabeledImages(image);
        Descriptor.then(value => { console.log(value); debugger; })
            .catch(() => { debugger; });
        console.log(Descriptor)
    })
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
            console.log(1)
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}


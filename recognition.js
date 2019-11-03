const imageUpload = document.getElementById('imageUpload')
let startTime, endTime
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
    startTime = new Date()
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)

    //    save
    //        var labeledFaceDescriptors = await loadLabeledImages()
    //        var labeledFaceDescriptorsJson = await labeledFaceDescriptors.map(x => x.toJSON())
    //        var json = JSON.stringify(labeledFaceDescriptorsJson);
    //        download(json, 'descriptors.json', 'text/plain');
    //        debugger;

    endTime = new Date()
    console.log((endTime - startTime) / 1000, 's')

    startTime = new Date()
    //load
    const response = await fetch('./descriptors.json');
    const myJson = await response.json();
    //    console.log(myJson);

    var newLabeledFaceDescriptors = myJson.map(x => faceapi.LabeledFaceDescriptors.fromJSON(x));
    //    console.log(newLabeledFaceDescriptors);
    endTime = new Date()
    console.log((endTime - startTime) / 1000, 's')

    const faceMatcher = new faceapi.FaceMatcher(newLabeledFaceDescriptors, 0.6)
    let image
    let canvas
    document.body.append('Loaded')
    imageUpload.addEventListener('change', async () => {
        if (image) image.remove()
        if (canvas) canvas.remove()
        image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = {
            width: image.width,
            height: image.height
        }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: result.toString()
            })
            drawBox.draw(canvas)
        })
    })
}

function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Kevin', 'Louis']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 1; i++) {
                const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`)
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

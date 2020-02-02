Promise.all([
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
	faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models'),
	faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
	faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(start);

function start() {
	const img = document.getElementById('imageUpload');

	if (img) {
		img.addEventListener('change', async () => {
			Promise.all([
				new Promise((resolve, reject) => {
					const imgUrl = window.URL.createObjectURL(img.files[0]);
					let imageTag = document.createElement('IMG');
					imageTag.src = imgUrl;
					imageTag.setAttribute('height', '30%');
					imageTag.setAttribute('width', '40%');
					resolve(imageTag);
				}),
				new Promise((resolve, reject) => {
					faceapi.bufferToImage(img.files[0]).then(image => {
						loadLabeledImages(image).then(values => {
							const descriptor = JSON.stringify(values);
							resolve(descriptor);
						});
					});
				})
			]).then(values => {
				//image
				console.log(values[0]);
				document.getElementById('imageShow').appendChild(values[0]);
				//descriptor
				sessionStorage.setItem('descriptor', values[1]);
			});
		});
	}
}
// sessionStorage.setItem('descriptor', descriptor)
async function loadLabeledImages(image) {
	const labels = ['owner'];
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

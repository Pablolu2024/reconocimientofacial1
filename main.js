
const MODEL_URL = './models';

document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById('video');
    const startCaptureButton = document.getElementById('startCapture');
    const overlay = document.getElementById('overlay');
    const overlayContext = overlay.getContext('2d');

    // Solicitar acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error("Error al acceder a la cámara: ", error);
        });

    // Cargar modelos de face-api.js
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

   // Cargar imágenes estáticas y sus descriptores
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.7);

    // Iniciar captura automática cada 10 segundos
    setInterval(async () => {
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(overlay, displaySize);

        // Detectar caras en el video
        const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Limpiar el canvas
        overlayContext.clearRect(0, 0, overlay.width, overlay.height);

        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const text = result.toString();
            const drawBox = new faceapi.draw.DrawBox(box, { label: text });
           

            if (result.label !== 'unknown') {
                alert(`Acceso autorizado para: ${result.label}`);
                drawBox.draw(overlay);
            } else {
                alert("Acceso denegado");
                drawBox.draw(overlay);
            }
       
switch (result.label) {
  case "Pablo": alert('Hola Pablo Bienvenido');
  case "Jirafa":
  case "Perro":
  case "Cerdo":
        }
          
        
        
        
        });
    },10000); // 10000 ms = 10 segundos

    async function loadLabeledImages() {
        const labels = ['Pablo', 'Sandy']; // Cambia estos nombres a los de tus imágenes
        return Promise.all(
            labels.map(async label => {
                const imgUrl = `./images/${label}.jpg`;
                const img = await faceapi.fetchImage(imgUrl);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (!detections) {
                    throw new Error(`No se pudo encontrar una cara en ${label}`);
                }
                return new faceapi.LabeledFaceDescriptors(label, [detections.descriptor]);
            })
        );
    }
});

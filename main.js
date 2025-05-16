
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
                alert(`Detectado : ${result.label}`);
                drawBox.draw(overlay);
            } else {
                alert("No detectado");
                drawBox.draw(overlay);
            }
       
switch (result.label) {
  case "Pablo": 
        const texto = "Pablo alias San Ignacio";
        const msg = new SpeechSynthesisUtterance(texto);
        window.speechSynthesis.speak(msg);
        break;
  case "Ivan":
        const texto1 = "Ivan Cizañas Moyota";
        const msg1 = new SpeechSynthesisUtterance(texto1);
        window.speechSynthesis.speak(msg1);
        break;
  case "Gonzalo":
        const texto2 = "Gonzalito el duro de las Monjitas";
        const msg2 = new SpeechSynthesisUtterance(texto2);
        window.speechSynthesis.speak(msg2);
        break;
  case "Edwin":
        const texto3 = "Edwin el jefecito";
        const msg3 = new SpeechSynthesisUtterance(texto3);
        window.speechSynthesis.speak(msg3);
         break;
  case "Fabian":
        const texto4 = "Fabian caramelito Flor";
        const msg4 = new SpeechSynthesisUtterance(texto4);
        window.speechSynthesis.speak(msg4);
         break;
  case "Eduardo":
        const texto5 = "Eduardo el peluchin de la sala";
        const msg5 = new SpeechSynthesisUtterance(texto5);
        window.speechSynthesis.speak(msg5);
         break;
default:
        const texto20 = "No detectado";
        const msg20 = new SpeechSynthesisUtterance(texto20);
        window.speechSynthesis.speak(msg20);

}
          
        
        
        
        });
    },10000); // 10000 ms = 10 segundos

    async function loadLabeledImages() {
        const labels = ['Pablo', 'Ivan' , 'Gonzalo' , 'Edwin' , 'Fabian' , 'Eduardo']; // Cambia estos nombres a los de tus imágenes
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

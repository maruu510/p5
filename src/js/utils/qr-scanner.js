// PackTrack System - QR Scanner
// This script is specifically for the codigoqr.html file

// Global variables
let scanner = null;
let canvasElement = document.createElement('canvas');
let canvas = canvasElement.getContext('2d');
let scanning = false;
let cameraId = null;
let cameraList = [];
let currentCameraIndex = 0;
let cameraPermissionGranted = false;
let currentQRPackage = null;

// Request camera permission
async function requestCameraPermission() {
  try {
    // Show a message explaining why we need camera access
    AppUtils.showToast('success', 'Se solicitará acceso a la cámara para escanear códigos QR', 5000);
    
    // Try to get camera access with basic configuration
    await navigator.mediaDevices.getUserMedia({ video: true });
    
    // If we get here, permission was granted
    cameraPermissionGranted = true;
    return true;
  } catch (error) {
    console.error('Permiso de cámara denegado:', error);
    AppUtils.showToast('error', 'Permiso de cámara denegado. Puede usar la entrada manual de códigos.', 5000);
    
    // Show manual entry option automatically
    toggleManualEntry(true);
    
    return false;
  }
}

// Start camera
async function startCamera() {
  try {
    // If we don't have permission yet, request it first
    if (!cameraPermissionGranted) {
      const permissionGranted = await requestCameraPermission();
      if (!permissionGranted) return;
    }
    
    // Hide manual form if visible
    toggleManualEntry(false);
    
    // Get list of available cameras
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameraList = devices.filter(device => device.kind === 'videoinput');
    
    if (cameraList.length === 0) {
      throw new Error('No se encontraron cámaras disponibles');
    }
    
    // Set current camera ID
    cameraId = cameraList[currentCameraIndex].deviceId;
    
    // On mobile devices, try to use the back camera by default
    let facingMode = 'environment'; // Back camera first
    
    // Get camera stream
    const constraints = {
      video: {
        deviceId: cameraId ? { exact: cameraId } : undefined,
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    const video = document.getElementById('qr-video');
    if (!video) throw new Error('Elemento de video no encontrado');
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.setAttribute('playsinline', true); // Important for iOS
    
    await video.play();
    scanning = true;
    requestAnimationFrame(tick);
    
    // Update UI
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    
    if (startButton) startButton.style.display = 'none';
    if (stopButton) stopButton.style.display = 'inline-flex';
    
    // Enable switch camera button only if there's more than one camera
    const switchCameraButton = document.getElementById('switch-camera');
    if (switchCameraButton) {
      switchCameraButton.disabled = cameraList.length <= 1;
    }
    
    // Show success message
    AppUtils.showToast('success', 'Cámara activada. Apunte al código QR');
    
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    AppUtils.showToast('error', 'Error al acceder a la cámara: ' + error.message);
    
    // If there's an error starting the camera, show the manual option
    toggleManualEntry(true);
  }
}

// Stop camera
function stopCamera() {
  scanning = false;
  
  const video = document.getElementById('qr-video');
  if (video && video.srcObject) {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  }
  
  // Update UI
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  
  if (startButton) startButton.style.display = 'inline-flex';
  if (stopButton) stopButton.style.display = 'none';
}

// Switch camera
function switchCamera() {
  if (cameraList.length <= 1) return;
  
  currentCameraIndex = (currentCameraIndex + 1) % cameraList.length;
  stopCamera();
  startCamera();
}

// Frame processing and QR detection
function tick() {
  if (!scanning) return;
  
  const video = document.getElementById('qr-video');
  if (!video) return;
  
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    
    const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    
    try {
      // Make sure jsQR is available
      if (typeof jsQR === 'undefined') {
        console.error('Error: La biblioteca jsQR no está disponible');
        return;
      }
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        // QR Code detected
        scanning = false;
        stopCamera();
        processQRCode(code.data);
      }
    } catch (e) {
      console.error('Error al procesar el QR:', e);
    }
  }
  
  if (scanning) {
    requestAnimationFrame(tick);
  }
}

// Process QR code
function processQRCode(data) {
  console.log('QR Code escaneado:', data);
  
  try {
    // Process with QR utils
    const result = QRUtils.processQRCodeData(data);
    
    if (result.success) {
      // Show the result container
      const resultContainer = document.getElementById('result-container');
      const resultContent = document.getElementById('result-content');
      
      if (resultContainer && resultContent) {
        resultContent.innerHTML = result.html;
        resultContainer.classList.add('active');
        
        // Store package data for further processing
        currentQRPackage = result.data;
      } else {
        throw new Error('Contenedor de resultados no encontrado');
      }
    } else {
      throw new Error(result.error || 'Error al procesar el código QR');
    }
  } catch (error) {
    console.error('Error al procesar el código QR:', error);
    AppUtils.showToast('error', 'Error al procesar el código QR: ' + error.message);
  }
}

// Toggle manual entry
function toggleManualEntry(show) {
  const manualForm = document.getElementById('manual-form');
  if (!manualForm) return;
  
  if (show) {
    manualForm.style.display = 'block';
    // If activating manual mode, stop the camera
    if (scanning) {
      stopCamera();
    }
  } else {
    manualForm.style.display = 'none';
    const manualCodeInput = document.getElementById('manual-code');
    if (manualCodeInput) manualCodeInput.value = '';
  }
}

// Process manual code
function processManualCode() {
  const manualCodeInput = document.getElementById('manual-code');
  if (!manualCodeInput) return;
  
  const manualCode = manualCodeInput.value.trim();
  
  if (!manualCode) {
    AppUtils.showToast('error', 'Por favor ingrese un código válido');
    return;
  }
  
  // Process the manually entered code
  processQRCode(manualCode);
  
  // Clear and hide the form
  manualCodeInput.value = '';
  toggleManualEntry(false);
}

// Process package (mark as delivered)
async function processPackage() {
  try {
    if (!currentQRPackage || !currentQRPackage.id) {
      throw new Error('No hay un paquete válido para procesar');
    }
    
    // Get packages from localStorage
    const packages = AppUtils.getAllPackages();
    
    // Find the package
    const packageIndex = packages.findIndex(pkg => pkg.id === currentQRPackage.id);
    
    if (packageIndex === -1) {
      // Package not found, ask if user wants to register it
      if (confirm('El paquete escaneado no está registrado en el sistema. ¿Desea registrarlo ahora?')) {
        // Redirect to register page with pre-filled data
        let queryParams = new URLSearchParams();
        
        if (currentQRPackage.apartment_number || currentQRPackage.apt) {
          queryParams.append('dept', currentQRPackage.apartment_number || currentQRPackage.apt);
        }
        
        if (currentQRPackage.id) {
          queryParams.append('code', currentQRPackage.id);
        }
        
        window.location.href = 'registerPackage.html?' + queryParams.toString();
        return;
      } else {
        throw new Error('Paquete no encontrado en el sistema');
      }
    }
    
    // Update package status
    const result = AppUtils.updatePackageStatus(currentQRPackage.id, 'retirado');
    
    if (result.success) {
      AppUtils.showToast('success', 'Paquete procesado correctamente');
      
      // Close result container after a delay
      setTimeout(() => {
        const resultContainer = document.getElementById('result-container');
        if (resultContainer) {
          resultContainer.classList.remove('active');
        }
        
        // Optionally restart the scanner
        startCamera();
      }, 1500);
    } else {
      throw new Error(result.message || 'Error al procesar el paquete');
    }
  } catch (error) {
    console.error('Error al procesar paquete:', error);
    AppUtils.showToast('error', error.message);
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is authenticated
  if (!AppUtils.checkAuth()) return;
  
  // Set up event listeners
  const startButton = document.getElementById('start-button');
  const stopButton = document.getElementById('stop-button');
  const switchCameraButton = document.getElementById('switch-camera');
  const closeResultButton = document.getElementById('close-result');
  const scanAgainButton = document.getElementById('scan-again');
  const processButton = document.getElementById('process-btn');
  const toggleManualButton = document.getElementById('toggle-manual');
  const processManualButton = document.getElementById('process-manual');
  const cancelManualButton = document.getElementById('cancel-manual');
  const manualCodeInput = document.getElementById('manual-code');
  
  // Start button
  if (startButton) {
    startButton.addEventListener('click', startCamera);
  }
  
  // Stop button
  if (stopButton) {
    stopButton.addEventListener('click', stopCamera);
  }
  
  // Switch camera button
  if (switchCameraButton) {
    switchCameraButton.addEventListener('click', switchCamera);
  }
  
  // Close result button
  if (closeResultButton) {
    closeResultButton.addEventListener('click', function() {
      const resultContainer = document.getElementById('result-container');
      if (resultContainer) {
        resultContainer.classList.remove('active');
      }
    });
  }
  
  // Scan again button
  if (scanAgainButton) {
    scanAgainButton.addEventListener('click', function() {
      const resultContainer = document.getElementById('result-container');
      if (resultContainer) {
        resultContainer.classList.remove('active');
      }
      startCamera();
    });
  }
  
  // Process button
  if (processButton) {
    processButton.addEventListener('click', processPackage);
  }
  
  // Toggle manual button
  if (toggleManualButton) {
    toggleManualButton.addEventListener('click', function() {
      const manualForm = document.getElementById('manual-form');
      if (manualForm) {
        toggleManualEntry(manualForm.style.display === 'none');
      }
    });
  }
  
  // Process manual button
  if (processManualButton) {
    processManualButton.addEventListener('click', processManualCode);
  }
  
  // Cancel manual button
  if (cancelManualButton) {
    cancelManualButton.addEventListener('click', function() {
      toggleManualEntry(false);
    });
  }
  
  // Handle Enter key in manual input
  if (manualCodeInput) {
    manualCodeInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        processManualCode();
      }
    });
  }
  
  // Start automatically on desktop devices
  if (!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
    // It's a desktop device, try to start automatically
    startCamera();
  }
});
// PackTrack System - QR Code Utilities
// This file contains functions for QR code generation and management

// Check if QRCode library is available
function checkQRLibrary() {
    if (typeof QRCode === 'undefined') {
      console.error('Error: La biblioteca QRCode no está disponible');
      return false;
    }
    return true;
  }
  
  // Generate QR code for a package
  function generatePackageQR(containerId, packageData) {
    try {
      if (!checkQRLibrary()) {
        throw new Error('La biblioteca QRCode no está disponible');
      }
      
      // Validate required package data
      if (!packageData.apartment_number || !packageData.id) {
        throw new Error('Datos de paquete incompletos para generar QR');
      }
      
      // Get QR container
      const qrContainer = document.getElementById(containerId);
      if (!qrContainer) {
        throw new Error(`Contenedor QR no encontrado: ${containerId}`);
      }
      
      // Clear previous QR
      qrContainer.innerHTML = '';
      
      // Create QR content
      const qrContent = JSON.stringify({
        id: packageData.id,
        apartment_number: packageData.apartment_number,
        sender: packageData.sender || '',
        delivery_date: packageData.delivery_date || '',
        generated: new Date().toISOString()
      });
      
      // Generate QR code
      new QRCode(qrContainer, {
        text: qrContent,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      
      // Make container visible
      qrContainer.style.display = 'block';
      
      return true;
    } catch (error) {
      console.error('Error al generar QR:', error);
      if (window.AppUtils && window.AppUtils.showToast) {
        window.AppUtils.showToast('error', 'Error al generar código QR: ' + error.message);
      }
      return false;
    }
  }
  
  // Print QR code
  function printQRCode(qrContainer, packageData) {
    try {
      // Validate inputs
      if (!qrContainer || !qrContainer.querySelector('canvas')) {
        throw new Error('Primero debe generar un código QR');
      }
      
      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión. Verifique que no estén bloqueadas las ventanas emergentes.');
      }
      
      // Format date if possible
      let formattedDate = packageData.delivery_date || '';
      if (window.AppUtils && window.AppUtils.formatDate && packageData.delivery_date) {
        formattedDate = window.AppUtils.formatDate(packageData.delivery_date);
      }
      
      // Create content
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Paquete - Depto ${packageData.apartment_number}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center; 
                margin: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 90vh;
              }
              .qr-print { 
                margin: 20px auto;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .details { 
                margin: 15px 0; 
                line-height: 1.5;
                max-width: 350px;
                text-align: left;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 8px;
                background-color: #f9f9f9;
              }
              h2 { color: #27ae60; margin-bottom: 20px; }
              .footer { 
                margin-top: 20px; 
                font-size: 0.8rem; 
                color: #888;
              }
            </style>
          </head>
          <body>
            <h2>Paquete para Departamento ${packageData.apartment_number}</h2>
            <div class="qr-print">
              ${qrContainer.innerHTML}
            </div>
            <div class="details">
              <p><strong>Remitente:</strong> ${packageData.sender || 'No especificado'}</p>
              <p><strong>Fecha:</strong> ${formattedDate}</p>
              <p><strong>Código:</strong> ${packageData.id}</p>
            </div>
            <div class="footer">
              Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (e) {
          console.error('Error al imprimir:', e);
          printWindow.close();
          throw new Error('Error al imprimir. Inténtelo de nuevo o use la opción de descarga.');
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error al imprimir QR:', error);
      if (window.AppUtils && window.AppUtils.showToast) {
        window.AppUtils.showToast('error', 'Error al imprimir el código QR: ' + error.message);
      }
      return false;
    }
  }
  
  // Download QR code as image
  function downloadQRCode(qrContainer, packageData) {
    try {
      // Validate inputs
      if (!qrContainer || !qrContainer.querySelector('canvas')) {
        throw new Error('Primero debe generar un código QR');
      }
      
      // Get canvas and convert to image
      const canvas = qrContainer.querySelector('canvas');
      if (!canvas) {
        throw new Error('No se encontró el código QR para descargar');
      }
      
      try {
        // Convert canvas to downloadable image
        const imgData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        
        downloadLink.href = imgData;
        downloadLink.download = `QR-Paquete-Depto-${packageData.apartment_number}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        return true;
      } catch (e) {
        // Alternative if there's a security error
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>QR Code</title></head>
              <body style="text-align: center; padding: 20px;">
                <h3>Código QR para Departamento ${packageData.apartment_number}</h3>
                <div>${qrContainer.innerHTML}</div>
                <p>Haga clic derecho en la imagen y seleccione "Guardar imagen como..." para descargarla</p>
              </body>
            </html>
          `);
          newWindow.document.close();
          return true;
        } else {
          throw new Error('No se pudo abrir una nueva ventana. Verifique que no estén bloqueadas.');
        }
      }
    } catch (error) {
      console.error('Error al descargar QR:', error);
      if (window.AppUtils && window.AppUtils.showToast) {
        window.AppUtils.showToast('error', 'Error al descargar el código QR: ' + error.message);
      }
      return false;
    }
  }
  
  // Process QR code data (for scanner)
  function processQRCodeData(data) {
    try {
      // Try to parse JSON
      let packageData;
      try {
        packageData = JSON.parse(data);
        
        // Return formatted JSON object
        return {
          success: true,
          isJson: true,
          data: packageData,
          html: `
            <p><strong>ID Paquete:</strong> ${packageData.id || 'No disponible'}</p>
            <p><strong>Departamento:</strong> ${packageData.apartment_number || packageData.apt || 'No disponible'}</p>
            <p><strong>Remitente:</strong> ${packageData.sender || 'No disponible'}</p>
            <p><strong>Fecha:</strong> ${packageData.delivery_date ? new Date(packageData.delivery_date).toLocaleDateString('es-ES') : 'No disponible'}</p>
            <p><strong>Estado:</strong> ${packageData.status || 'Pendiente'}</p>
          `
        };
      } catch (e) {
        // Not valid JSON, check if it's a package code
        if (data.startsWith('PKG-')) {
          const parts = data.split('-');
          if (parts.length >= 3) {
            return {
              success: true,
              isJson: false,
              data: {
                id: data,
                apartment_number: parts[1] || '',
                timestamp: parts[2] || ''
              },
              html: `
                <p><strong>Código de Paquete:</strong> ${data}</p>
                <p><strong>Departamento:</strong> ${parts[1] || 'No disponible'}</p>
                <p><strong>Fecha (código):</strong> ${parts[2] || 'No disponible'}</p>
              `
            };
          }
        }
        
        // Just plain text
        return {
          success: true,
          isJson: false,
          data: { text: data },
          html: `<p><strong>Contenido:</strong> ${data}</p>`
        };
      }
    } catch (error) {
      console.error('Error al procesar datos del QR:', error);
      return {
        success: false,
        error: error.message,
        html: `<p><strong>Error:</strong> No se pudo procesar el código QR</p>`
      };
    }
  }
  
  // Export all functions
  window.QRUtils = {
    checkQRLibrary,
    generatePackageQR,
    printQRCode,
    downloadQRCode,
    processQRCodeData
  };
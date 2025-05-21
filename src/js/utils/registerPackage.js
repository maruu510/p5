// PackTrack System - Package Registration
// This script is specifically for the registerPackage.html file

// Global variables
let packageFormData = {
    id: null,
    apartment_number: '',
    sender: '',
    delivery_date: '',
    status: 'pendiente',
    qr_code: '',
    notes: ''
  };
  
  // Initialize the form
  function initializeForm() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('delivery_date');
    if (dateInput) {
      dateInput.value = today;
    }
    
    // Set status default value
    const statusSelect = document.getElementById('status');
    if (statusSelect && !statusSelect.value) {
      statusSelect.value = 'pendiente';
    }
    
    // Add validation to required fields
    const requiredInputs = document.querySelectorAll('.form-input[required]');
    requiredInputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', function() {
        if (this.closest('.form-group').classList.contains('invalid')) {
          validateField.call(this);
        }
      });
    });
  }
  
  // Validate a single field
  function validateField() {
    const field = this;
    const parent = field.closest('.form-group');
    
    if (!parent) return true;
    
    if (field.hasAttribute('required') && !field.value.trim()) {
      parent.classList.add('invalid');
      return false;
    } else {
      parent.classList.remove('invalid');
      return true;
    }
  }
  
  // Validate the entire form
  function validateForm() {
    let isValid = true;
    
    const requiredInputs = document.querySelectorAll('.form-input[required]');
    requiredInputs.forEach(input => {
      const parent = input.closest('.form-group');
      
      if (input.hasAttribute('required') && !input.value.trim()) {
        if (parent) parent.classList.add('invalid');
        isValid = false;
      } else {
        if (parent) parent.classList.remove('invalid');
      }
    });
    
    if (!isValid) {
      // Focus on first invalid field
      const firstInvalid = document.querySelector('.form-group.invalid .form-input');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
    
    return isValid;
  }
  
  // Get data from form
  function getFormData() {
    return {
      id: document.getElementById('qr_code').value || null,
      apartment_number: document.getElementById('apartment_number').value,
      sender: document.getElementById('sender').value.trim(),
      delivery_date: document.getElementById('delivery_date').value,
      status: document.getElementById('status').value || 'pendiente',
      notes: document.getElementById('notes').value.trim()
    };
  }
  
  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      AppUtils.showToast('error', 'Por favor complete todos los campos requeridos');
      return;
    }
    
    // Show loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.add('active');
    
    try {
      // Get data from form
      const packageData = getFormData();
      
      // Check if QR code is generated
      if (!packageData.id) {
        // Confirm if user wants to continue without QR
        if (!confirm('No has generado un código QR para este paquete. ¿Deseas continuar sin código QR?')) {
          if (loadingOverlay) loadingOverlay.classList.remove('active');
          return;
        }
        
        // Generate a code if continuing without QR
        packageData.id = AppUtils.generateUniqueId();
      }
      
      // Save package
      const result = AppUtils.savePackage(packageData);
      
      if (result.success) {
        AppUtils.showToast('success', '¡Paquete registrado exitosamente!');
        
        // Show summary in console
        console.log('Paquete registrado:', result.package);
        
        // Wait and redirect
        setTimeout(() => {
          window.location.href = 'listPackages.html';
        }, 1500);
      } else {
        throw new Error(result.message || 'Error al guardar el paquete');
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      AppUtils.showToast('error', error.message || 'Ocurrió un error al registrar el paquete');
    } finally {
      // Hide loading
      if (loadingOverlay) loadingOverlay.classList.remove('active');
    }
  }
  
  // Generate QR code
  function handleGenerateQR() {
    try {
      // Get form data
      const packageData = getFormData();
      
      // Validate required fields for QR
      if (!packageData.apartment_number) {
        AppUtils.showToast('error', 'Por favor seleccione un departamento');
        document.getElementById('apartment_number').focus();
        return;
      }
      
      if (!packageData.sender) {
        AppUtils.showToast('error', 'Por favor ingrese el remitente');
        document.getElementById('sender').focus();
        return;
      }
      
      // Generate unique ID if not present
      if (!packageData.id) {
        packageData.id = AppUtils.generateUniqueId();
        document.getElementById('qr_code').value = packageData.id;
      }
      
      // Generate QR
      if (QRUtils.generatePackageQR('qrCode', packageData)) {
        // Show QR buttons
        const qrButtons = document.getElementById('qrButtons');
        if (qrButtons) qrButtons.style.display = 'flex';
        
        AppUtils.showToast('success', 'Código QR generado correctamente');
      }
    } catch (error) {
      console.error('Error al generar QR:', error);
      AppUtils.showToast('error', 'Error al generar código QR: ' + error.message);
    }
  }
  
  // Print QR code
  function handlePrintQR() {
    const qrCodeDiv = document.getElementById('qrCode');
    const packageData = getFormData();
    
    QRUtils.printQRCode(qrCodeDiv, packageData);
  }
  
  // Download QR code
  function handleDownloadQR() {
    const qrCodeDiv = document.getElementById('qrCode');
    const packageData = getFormData();
    
    QRUtils.downloadQRCode(qrCodeDiv, packageData);
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Form submission
    const packageForm = document.getElementById('packageForm');
    if (packageForm) {
      packageForm.addEventListener('submit', handleFormSubmit);
    }
    
    // QR code generation
    const generateQrBtn = document.getElementById('generateQrBtn');
    if (generateQrBtn) {
      generateQrBtn.addEventListener('click', handleGenerateQR);
    }
    
    // QR code printing
    const printQrBtn = document.getElementById('printQrBtn');
    if (printQrBtn) {
      printQrBtn.addEventListener('click', handlePrintQR);
    }
    
    // QR code download
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    if (downloadQrBtn) {
      downloadQrBtn.addEventListener('click', handleDownloadQR);
    }
  }
  
  // Initialize the page
  document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AppUtils.checkAuth()) return;
    
    // Initialize the form
    initializeForm();
    
    // Load departments
    const deptSelect = document.getElementById('apartment_number');
    if (deptSelect) {
      // Clear existing options except the first
      while (deptSelect.options.length > 1) {
        deptSelect.remove(1);
      }
      
      // Get departments
      const departments = AppUtils.getAllDepartments();
      
      // Add departments to select
      departments.forEach(dept => {
        const deptNumber = dept.number || '';
        if (deptNumber) {
          const option = document.createElement('option');
          option.value = deptNumber;
          option.textContent = `Departamento ${deptNumber}`;
          deptSelect.appendChild(option);
        }
      });
      
      // Add option for new department
      const newOption = document.createElement('option');
      newOption.value = "new";
      newOption.textContent = "Agregar nuevo departamento";
      deptSelect.appendChild(newOption);
      
      // Handle selection of "new" option
      deptSelect.addEventListener('change', function() {
        if (this.value === 'new') {
          const newDept = prompt('Ingrese el número del nuevo departamento:');
          if (newDept && !isNaN(newDept)) {
            const result = AppUtils.addDepartment(newDept);
            
            if (result.success) {
              // Create new option
              const option = document.createElement('option');
              option.value = newDept;
              option.textContent = `Departamento ${newDept}`;
              
              // Insert before "new" option
              const newIndex = this.options.length - 1;
              this.insertBefore(option, this.options[newIndex]);
              
              // Select the new department
              this.value = newDept;
              
              AppUtils.showToast('success', 'Departamento agregado correctamente');
            } else {
              AppUtils.showToast('error', result.message);
              this.value = ''; // Reset if invalid
            }
          } else {
            this.value = ''; // Reset if invalid
            AppUtils.showToast('error', 'Por favor ingrese un número válido para el departamento');
          }
        }
      });
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup user profile dropdown
    AppUtils.setupUserDropdown();
    
    console.log('Página de registro de paquetes inicializada correctamente');
  });
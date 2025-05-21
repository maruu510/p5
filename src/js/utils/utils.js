// PackTrack System - Utility Functions
// This file contains standardized functions used across the application

/**
 * Authentication Functions
 */

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!token || !isLoggedIn) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
  
  // Log out user
  function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
  }
  
  /**
   * Department Functions
   */
  
  // Get all departments with standardized format
  function getAllDepartments() {
    try {
      console.log("Obteniendo departamentos desde localStorage...");
      const departmentsString = localStorage.getItem('departments');
      
      // If no data, return empty array
      if (!departmentsString) {
        console.log("No se encontraron departamentos en localStorage");
        return [];
      }
      
      let departments;
      try {
        departments = JSON.parse(departmentsString);
        console.log("Departamentos parseados:", departments);
      } catch (parseError) {
        console.error("Error al parsear departamentos:", parseError);
        return [];
      }
      
      // Check if it's an array
      if (!Array.isArray(departments)) {
        console.warn("Los departamentos no están en formato array:", departments);
        // Try to convert to array if possible
        if (departments) {
          return [departments];
        }
        return [];
      }
      
      // Normalize format: convert all departments to a standard format
      const normalizedDepts = departments.map(dept => {
        // If null or undefined, skip
        if (dept === null || dept === undefined) {
          return null;
        }
        
        // If already an object with number
        if (typeof dept === 'object' && dept !== null) {
          // Prioritize 'number' property, then 'deptNumber', then 'numero'
          const deptNumber = dept.number || dept.deptNumber || dept.numero;
          if (deptNumber) {
            return { number: deptNumber.toString() };
          }
          return null; // Skip if no number
        }
        
        // If primitive value (string or number)
        return { number: dept.toString() };
      });
      
      // Filter null values
      const validDepts = normalizedDepts.filter(dept => dept !== null);
      console.log("Departamentos normalizados:", validDepts);
      
      return validDepts;
    } catch (error) {
      console.error("Error general al obtener departamentos:", error);
      return [];
    }
  }
  
  // Add a new department
  function addDepartment(deptNumber) {
    try {
      if (!deptNumber || isNaN(deptNumber)) {
        throw new Error('Número de departamento inválido');
      }
      
      const departments = getAllDepartments();
      
      // Check if department already exists
      const exists = departments.some(dept => {
        const num = dept.number || '';
        return num.toString() === deptNumber.toString();
      });
      
      if (exists) {
        throw new Error('Este departamento ya existe');
      }
      
      // Add new department
      departments.push({ number: deptNumber.toString() });
      
      // Save to localStorage
      localStorage.setItem('departments', JSON.stringify(departments));
      
      return { success: true, message: 'Departamento agregado correctamente' };
    } catch (error) {
      console.error('Error al agregar departamento:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Package Functions
   */
  
  // Get all packages
  function getAllPackages() {
    try {
      const packagesData = localStorage.getItem('packages');
      return packagesData ? JSON.parse(packagesData) : [];
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
      return [];
    }
  }
  
  // Get packages by department
  function getPackagesByDepartment(deptId) {
    if (!deptId || deptId === 'all') {
      return getAllPackages();
    }
    
    try {
      const packages = getAllPackages();
      return packages.filter(pkg => pkg.apartment_number === deptId);
    } catch (error) {
      console.error(`Error al obtener paquetes del departamento ${deptId}:`, error);
      return [];
    }
  }
  
  // Save a package
  function savePackage(packageData) {
    try {
      if (!packageData.apartment_number || !packageData.sender || !packageData.delivery_date) {
        throw new Error('Faltan datos requeridos');
      }
      
      // Generate ID if not provided
      if (!packageData.id) {
        packageData.id = generateUniqueId();
      }
      
      // Add timestamps
      packageData.created_at = new Date().toISOString();
      
      // Get existing packages
      const packages = getAllPackages();
      
      // Add new package
      packages.push(packageData);
      
      // Save to localStorage
      localStorage.setItem('packages', JSON.stringify(packages));
      
      // Update pending count for notifications
      updateNotificationCount();
      
      return { success: true, package: packageData };
    } catch (error) {
      console.error('Error al guardar paquete:', error);
      return { success: false, message: error.message };
    }
  }
  
  // Update package status
  function updatePackageStatus(packageId, newStatus) {
    try {
      const packages = getAllPackages();
      const index = packages.findIndex(pkg => pkg.id === packageId);
      
      if (index === -1) {
        throw new Error('Paquete no encontrado');
      }
      
      packages[index].status = newStatus;
      packages[index].updated_at = new Date().toISOString();
      
      localStorage.setItem('packages', JSON.stringify(packages));
      
      // Update notification count
      updateNotificationCount();
      
      return { success: true, package: packages[index] };
    } catch (error) {
      console.error('Error al actualizar paquete:', error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Utility Functions
   */
  
  // Generate unique ID
  function generateUniqueId() {
    return 'PKG-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  
  // Format date
  function formatDate(dateString) {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  }
  
  // Show toast notification
  function showToast(type, message, duration = 3000) {
    const toastId = type === 'success' ? 'toastSuccess' : 'toastError';
    const messageId = type === 'success' ? null : 'errorMessage';
    
    const toast = document.getElementById(toastId);
    if (!toast) return;
    
    if (messageId) {
      const messageEl = document.getElementById(messageId);
      if (messageEl) messageEl.textContent = message;
    } else {
      const messageEl = toast.querySelector('.toast-message');
      if (messageEl) messageEl.textContent = message;
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
  
  // Update notification count (pending packages)
  function updateNotificationCount() {
    try {
      const packages = getAllPackages();
      const pendingCount = packages.filter(pkg => pkg.status === 'pendiente').length;
      
      // Update notification badge if exists
      const notificationBadge = document.getElementById('notificationCount');
      if (notificationBadge) {
        notificationBadge.textContent = pendingCount;
      }
      
      return pendingCount;
    } catch (error) {
      console.error('Error al actualizar contador de notificaciones:', error);
      return 0;
    }
  }
  
  // Get statistics
  function getStats() {
    try {
      const packages = getAllPackages();
      const departments = getAllDepartments();
      
      return {
        totalPackages: packages.length,
        departmentsCount: departments.length,
        pendingPackages: packages.filter(pkg => pkg.status === 'pendiente').length,
        deliveredPackages: packages.filter(pkg => pkg.status === 'retirado' || pkg.status === 'entregado').length
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalPackages: 0,
        departmentsCount: 0,
        pendingPackages: 0,
        deliveredPackages: 0
      };
    }
  }
  
  // Setup user dropdown
  function setupUserDropdown() {
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!userProfileDropdown || !userDropdown) return;
    
    userProfileDropdown.addEventListener('click', function(e) {
      userDropdown.classList.toggle('show');
      e.stopPropagation();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!userProfileDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
  }
  
  // Data migration (if needed)
  function migrateData() {
    try {
      // Check for old packages data
      const oldPackages = localStorage.getItem('paquetesPrueba');
      if (oldPackages && !localStorage.getItem('packages')) {
        localStorage.setItem('packages', oldPackages);
        console.log('Migrated package data from old format');
      }
      
      // Standardize departments
      const departments = getAllDepartments();
      localStorage.setItem('departments', JSON.stringify(departments));
      console.log('Departments standardized');
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  }
  
  // Initialize the application with standard elements
  function initApp() {
    // Check authentication
    if (!checkAuth()) return;
    
    // Migrate data if needed
    migrateData();
    
    // Setup user dropdown
    setupUserDropdown();
    
    // Update notification count
    updateNotificationCount();
    
    console.log('Aplicación inicializada correctamente');
  }
  
  // Export all functions
  window.AppUtils = {
    checkAuth,
    logout,
    getAllDepartments,
    addDepartment,
    getAllPackages,
    getPackagesByDepartment,
    savePackage,
    updatePackageStatus,
    generateUniqueId,
    formatDate,
    showToast,
    updateNotificationCount,
    getStats,
    setupUserDropdown,
    migrateData,
    initApp
  };
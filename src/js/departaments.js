//departament.js
// Funciones para gestionar departamentos

// Obtener todos los departamentos
function getAllDepartments() {
  const departments = localStorage.getItem('departments');
  return departments ? JSON.parse(departments) : [];
}

// Guardar la lista de departamentos
function saveDepartments(departments) {
  localStorage.setItem('departments', JSON.stringify(departments));
}

// Agregar un nuevo departamento si no existe
function addDepartment(departmentNumber) {
  const departments = getAllDepartments();
  if (!departments.includes(departmentNumber)) {
    departments.push(departmentNumber);
    saveDepartments(departments);
  }
  return departments;
}
  
  // Obtener paquetes por departamento
  function getPackagesByDepartment(departmentNumber) {
    const key = `packages_${departmentNumber}`;
    const packages = localStorage.getItem(key);
    return packages ? JSON.parse(packages) : [];
  }
  
  // Guardar paquetes para un departamento específico
  function savePackagesToDepartment(departmentNumber, packages) {
    const key = `packages_${departmentNumber}`;
    localStorage.setItem(key, JSON.stringify(packages));
  }
  
  // Agregar un paquete a un departamento
  function addPackageToDepartment(departmentNumber, packageData) {
    // Asegurarse de que el departamento existe
    addDepartment(departmentNumber);
    
    // Obtener paquetes actuales y agregar el nuevo
    const packages = getPackagesByDepartment(departmentNumber);
    packages.push(packageData);
    
    // Guardar los paquetes actualizados
    savePackagesToDepartment(departmentNumber, packages);
    
    return packages;
  }

// Eliminar un departamento
function removeDepartment(departmentNumber) {
  const departments = getAllDepartments();
  const updatedDepartments = departments.filter(dept => dept !== departmentNumber);
  saveDepartments(updatedDepartments);
  
  // También eliminar los paquetes asociados
  localStorage.removeItem(`packages_${departmentNumber}`);
  
  return updatedDepartments;
}
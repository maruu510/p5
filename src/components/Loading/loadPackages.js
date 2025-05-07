//loadPackages.js
import { showLoading, hideLoading } from './loading.js';

export async function loadPackages() {
  try {
    showLoading(); // Mostrar loading antes de cargar
    const response = await fetch('/api/packages');
    const packages = await response.json();

    const tbody = document.querySelector('#packagesTable tbody');
    tbody.innerHTML = '';

    packages.forEach(pkg => {
      const row = `
        <tr>
          <td>${pkg.id}</td>
          <td>${pkg.apartment_number}</td>
          <td>${pkg.sender}</td>
          <td>${new Date(pkg.delivery_date).toLocaleDateString()}</td>
          <td>${pkg.status}</td>
          <td>
            ${pkg.status === 'pendiente' 
              ? `<button onclick="updateStatus(${pkg.id})">Marcar Retirado</button>` 
              : ''}
          </td>
        </tr>`;
      tbody.innerHTML += row;
    });
  } catch (_error) {
    alert("Error al cargar los paquetes");
  } finally {
    hideLoading(); // Ocultar loading al terminar
  }
}

export async function updateStatus(id) {
  try {
    showLoading(); // Mostrar loading antes de actualizar
    await fetch(`/api/packages/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'retirado' })
    });
    await loadPackages(); // Recargar la lista después de actualizar
  } catch (_error) {
    alert("Error al actualizar el estado del paquete");
    hideLoading(); // Ocultar loading en caso de error
  }
}
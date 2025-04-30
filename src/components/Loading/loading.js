// Funciones para controlar el loading
export function showLoading() {
  const loading = document.querySelector('.loading-overlay');
  loading.style.display = 'flex';
}

export function hideLoading() {
  const loading = document.querySelector('.loading-overlay');
  loading.style.display = 'none';
}
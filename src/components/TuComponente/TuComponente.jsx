import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

function TuComponente() {
  const { mostrarCargando, ocultarCargando, mostrarToast } = useApp();

  const handleClick = async () => {
    try {
      mostrarCargando();
      // ... existing code ...
      await fetch('tu-api');
      mostrarToast('¡Operación exitosa!', 'success');
    } catch (_error) {
      mostrarToast('Error en la operación', 'error');
    } finally {
      ocultarCargando();
    }
  };

  return (
    <div>
      <h1>Mi Aplicación</h1>
      <button type="button" onClick={handleClick}>Realizar Acción</button>
    </div>
  );
}

export default TuComponente;
import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ mensaje, tipo = 'info', onClose, duracion = 3000 }) => {
  useEffect(() => {
    const temporizador = setTimeout(() => {
      onClose();
    }, duracion);

    return () => clearTimeout(temporizador);
  }, [duracion, onClose]);

  return (
    <div className={`toast toast-${tipo}`}>
      <div className="toast-contenido">
        {mensaje}
      </div>
      <button type="button" className="toast-cerrar" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
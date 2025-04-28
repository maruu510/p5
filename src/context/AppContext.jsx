import React, { createContext, useContext, useState } from 'react';
import Loading from '../components/Loading/Loading.jsx';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cargando, setCargando] = useState(false);
  const [toasts, setToasts] = useState([]);

  const mostrarCargando = () => setCargando(true);
  const ocultarCargando = () => setCargando(false);

  const mostrarToast = (mensaje, tipo = 'info', duracion = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, mensaje, tipo, duracion }]);
  };

  const cerrarToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <AppContext.Provider value={{ mostrarCargando, ocultarCargando, mostrarToast }}>
      {children}
      {cargando && <Loading />}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            mensaje={toast.mensaje}
            tipo={toast.tipo}
            duracion={toast.duracion}
            onClose={() => cerrarToast(toast.id)}
          />
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
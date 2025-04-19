import React from 'react';
import './Header.css'; // Importa el archivo CSS para estilos

const Header = () => {
    return (
        <header className="header">
            <h1>Gestor de Paquetes</h1>
            <nav>
                <ul>
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/packages">Paquetes</a></li>
                    <li><a href="/about">Acerca de</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
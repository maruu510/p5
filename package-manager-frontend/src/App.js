import logo from './logo.svg';
import './App.css';


import React from 'react';
import Header from './components/Header';

function App() {
    return (
        <div className="App">
            <Header />
            {/* Aquí puedes agregar otros componentes como PackageList */}
        </div>
    );
}

export default App;
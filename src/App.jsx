import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserValid } from './firebase/firebase'; // Importa la función getUserValid desde tu archivo firebase.js

// Importamos los componentes creados
import Home from './componentes/Home';
import Gastos from './componentes/Gastos';
import Recordatorios from './componentes/Recordatorios';
import Presupuesto from './componentes/Presupuesto';
import Informes from './componentes/Informes';
import Navigation from './layouts/Navigation';
import LandingPage from './componentes/LandingPage';
import LoginPage from './componentes/LoginPage';
import RegisterPage from './componentes/RegisterPage';
import Logout from './componentes/Logout';

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(null);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const isAuthenticated = await getUserValid();
        setUserLoggedIn(isAuthenticated);
        console.log("isAuthenticated:", isAuthenticated); // Agregar esta línea
      } catch (error) {
        setUserLoggedIn(false);
      }
    };
  
    checkUserAuthentication();
  }, []);
  
  console.log("userLoggedIn:", userLoggedIn); // Mover esta línea fuera de useEffect

  if (userLoggedIn === null) {
    return (
      <div class="loading-container">
        <div class="loading-circle"></div>
        <div class="loading-text">Cargando...</div>
      </div>
// Mostrar un indicador de carga mientras se verifica la autenticación
    );
  }
  
  console.log("userLoggedIn:", userLoggedIn); // Mover esta línea fuera de useEffect
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {userLoggedIn ? (
            <Route path="/dashboard" element={<Navigation />}>
              <Route path="/dashboard/home" element={<Home />} />
              <Route path="/dashboard/gastos" element={<Gastos />} />
              <Route path="/dashboard/recordatorios" element={<Recordatorios />} />
              <Route path="/dashboard/presupuesto" element={<Presupuesto />} />
              <Route path="/dashboard/informes" element={<Informes />} />
              <Route path="/dashboard/logout" element={<Logout />} />
            </Route>
          ) : (
            <Route path="/dashboard/*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

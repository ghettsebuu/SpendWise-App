import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserValid } from './firebase/firebase';

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
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const isAuthenticated = await getUserValid();
        setUserLoggedIn(isAuthenticated);
        console.log("isAuthenticated:", isAuthenticated);
      } catch (error) {
        console.error("Error en la autenticación:", error);
        setConnectionError(true);
        setUserLoggedIn(false);
      }
    };

    checkUserAuthentication();
  }, []);

  if (userLoggedIn === null || connectionError) {
    return (
      <div className="loading-container">
        {connectionError ? (
          <div className="error-message fun-error">
            <span role="img" aria-label="Sad Face" className="icon">😞</span>
            Ha ocurrido un error de conexión. Por favor, inténtalo de nuevo más tarde.
          </div>
        
        ) : (
          <>
            <div className="loading-circle"></div>
            <div className="loading-text">Cargando...</div>
          </>
        )}
      </div>
    );
  }

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

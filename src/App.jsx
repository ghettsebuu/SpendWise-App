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
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    // Lógica para obtener el estado de autenticación
    const checkUserAuthentication = async () => {
      try {
        await getUserValid();
        setUserLoggedIn(true);
      } catch (error) {
        setUserLoggedIn(false);
      }
    };

    checkUserAuthentication();
  }, []);

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

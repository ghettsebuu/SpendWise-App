import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';



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

function App() {
  const userLoggedIn = true; // Variable para simular si el usuario ha iniciado sesión
 


  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {userLoggedIn && (
            <Route path="/dashboard" element={<Navigation />}>
              <Route path="/dashboard/home" element={<Home />} />
              <Route path="/dashboard/gastos" element={<Gastos />} />
              <Route path="/dashboard/recordatorios" element={<Recordatorios />} />
              <Route path="/dashboard/presupuesto" element={<Presupuesto />} />
              <Route path="/dashboard/informes" element={<Informes />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

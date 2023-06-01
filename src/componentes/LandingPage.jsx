import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/LandingPage.css';


function LandingPage() {
  return (
    <div>
      <header>
        <nav className="navigation">
          <NavLink className="navigation__link " to="/login" activeClassName="active">Acceder</NavLink>
        </nav>
        <div className="texts">
          <h1 className="texts__title">Bienvenidos a SpendWise</h1>
        </div>
      </header>
      <div className="container">
        <div className="header">
          <h1>¡Controla tus gastos!</h1>
          <p>Empieza a tener el control de tus finanzas personales de forma fácil y divertida.</p>
        </div>
        <div className="button-container">
          <NavLink className="btn animation " to="/login">¡Comienza ahora!</NavLink>
        </div>
      </div>
      <footer className="footer">
      <div className="footer-content">
        <p >© 2023 SpendWise. Todos los derechos reservados.</p>
      </div>
    </footer>
    </div>
    
  );
}

export default LandingPage;

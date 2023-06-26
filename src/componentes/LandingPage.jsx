import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import '../assets/LandingPage.css';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

function LandingPage() {
  const [validar, setValidar] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (data) => {
      setValidar(data.displayName);
    });
  }, []);

  return (
    <div>
      <header>
        <nav className="navigation">
          {auth.currentUser ? (
            <div>
              <NavLink className="navigation__link" to="/dashboard/home" activeClassName="active">
                {validar}
              </NavLink>
            </div>
          ) : (
            <NavLink className="navigation__link" to="/login" activeClassName="active">
              Acceder
            </NavLink>
          )}
        </nav>
        <div className="texts">
          <h1 className="texts__title">Bienvenidos a SpendWise</h1>
        </div>
        
      </header>

      <section className="section caracteristicas">
        <div className="section-content">
          <h2>Características principales</h2>
          <div className="feature-list">
            <div className="feature">
            <img src='src/assets/img/8670874.jpg' alt="Gastos" />
              <h3>Registro de gastos</h3> 
            </div>
            <div className="feature">
            <img src='src/assets/img/4682641.jpg' alt="Recordatorios" />
              <h3>Recordatorios</h3> 
            </div>
            <div className="feature">
            <img src='src/assets/img/6550818.jpg' alt="Presupuesto" />
              <h3>Presupuesto</h3>
            </div>
            <div className="feature">
              <img src='src/assets/img/5603126.jpg' alt="Informes" />
              <h3>Informe de gastos</h3>
            </div>
          </div>
        </div>
      </section>


      <div className="container">
          <div className="header">
            <h1>¡Controla tus gastos!</h1>
            <p>Ten el control de tus finanzas personales de forma fácil y divertida.</p>
          </div>
          <div className="button-container">
            {auth.currentUser ? (
              <div>
                <NavLink className="btn animation" to="/dashboard/gastos">
                  ¡Agrega tus gastos!
                </NavLink>
              </div>
            ) : (
              <NavLink className="btn animation" to="/login">
                ¡Comienza ahora!
              </NavLink>
            )}
          </div>
          <div className="illustration">
            <img src='src/assets/img/6333412.jpg' alt="Descripción de la imagen" />
          </div>
        </div>

       
     
      <section className="section footer">
        <div className="section-content">
          <div className="social-icons">
            {/* Aquí puedes agregar enlaces a las redes sociales de tu empresa */}
            <a href="https://example.com">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="https://example.com">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://example.com">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-content">
          <p>Copyright© 2023 SpendWise. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

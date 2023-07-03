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
      
        <nav className="navigation">
          <img className="logo" src="src/assets/img/logodef.png" alt="Logo" />
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
      
        <header class="container">
          <div class="texts"> 
            <h1 class="texts__title">¡Bienvenido  
              a <span class="texts__highlight">Spend</span><span class="texts__normal">Wise</span>!
            </h1>

              <p class="texts__paragraph">El dinero no crece en los árboles, pero nuestra aplicación <br />te ayuda a cuidarlo...</p>
              
          </div>
        </header>


      <section className="section caracteristicas">
        <div className="section-content">
          <h2>Características principales</h2>
          <div className="feature-list">
            <div className="feature">
            <img src='src/assets/img/2.png' alt="Gastos" />
              <h3>Registro de gastos</h3> 
            </div>
            <div className="feature">
            <img src='src/assets/img/3.png' alt="Recordatorios" />
              <h3>Recordatorios</h3> 
            </div>
            <div className="feature">
            <img src='src/assets/img/4.png' alt="Presupuesto" />
              <h3>Presupuesto</h3>
            </div>
            <div className="feature">
              <img src='src/assets/img/5.png' alt="Informes" />
              <h3>Informe de gastos</h3>
            </div>
          </div>
        </div>
      </section>


      <div class="container">
        <div class="illustration">
          <img src="src/assets/img/logodef.png" alt="Descripción de la imagen" />
        </div>
        <div class="content">
          <div class="header">
            <p className='textcolor'>"¿Te preguntas a dónde va tu dinero? <br />
              No te preocupes, nuestra app tiene un GPS financiero".</p>
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

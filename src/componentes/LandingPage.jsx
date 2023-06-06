import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { auth} from '../firebase/firebase';
import '../assets/LandingPage.css';
import { onAuthStateChanged } from 'firebase/auth';


function LandingPage() {
  
  const [validar, setValidar] = useState(false);
  

  useEffect(() => {
    onAuthStateChanged(auth, (data) =>{
      setValidar(data.displayName)
    })
  
   
  }, [])
  

 
  
  

  return (
    <div>
      <header>
        <nav className="navigation">
          
          {
            auth.currentUser ?  <div>
              
              <NavLink className="navigation__link " to="/dashboard/home" activeClassName="active"> Bienvenido {validar} Dashboard</NavLink> 
            </div>
            : 
             <NavLink className="navigation__link " to="/login" activeClassName="active">Acceder</NavLink>
          }
  
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

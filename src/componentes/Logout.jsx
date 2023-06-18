import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

import 'react-toastify/dist/ReactToastify.css';
import { Navigate } from 'react-router-dom';

const Logout = () => {
  const [log, setLog] = useState(false);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setLog(true);
      })
      .catch((error) => {
        // Handle error
      });
  };

  return (
    <div className="cont">
      
      <div className='boton-salir'>
          <h2>¡Vuelve pronto!</h2>
          <button className='button-salir' onClick={handleLogout}>
            <FontAwesomeIcon icon={faPowerOff} /> Salir {/* Utilizar el icono de apagar */}
          </button>
          {log && <Navigate to="/" replace={true} />}
      </div>
      
    </div>
  );
};

export default Logout;

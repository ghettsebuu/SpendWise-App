import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from "firebase/auth";


import "react-toastify/dist/ReactToastify.css";
import { Navigate } from 'react-router-dom';
const Logout = () => {
    const [log, setlog] = useState(false)
    const out =()=> {
       
        const auth = getAuth();
        signOut(auth).then(() => {
            setlog(true)
        }).catch((error) => {
          // An error happened.
        });

    }
console.log(log)
  return (
    <div className='cont'>
      <h2>Vuelve pronto</h2>
      <button onClick={out}>Salir</button>
        {
            log && <Navigate to="/"  replace={true} />
        }
    </div>
  );
};

export default Logout;

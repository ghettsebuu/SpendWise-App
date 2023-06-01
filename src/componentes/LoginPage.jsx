import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import '../assets/LoginPage.css';
import { auth, userExists } from '../firebase/firebase';

import { FaGoogle } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';

import { useEffect, useState } from 'react';

import { useNavigate } from "react-router-dom";
import AuthProvider from '../layouts/authProvider';

const LoginPage = () => {
     
    const Navigate = useNavigate();
    // const [currentUser, setCurrentUser]= useState(null);
    /*
    State
    0: inicializado
    1: cargando
    2:login completo
    3:login pero sin registro
    4: no hay nadie logueado 
    5: ya existe username
    6: nuevo username . clic para continuar
    */
    const [state, setCurrentState]= useState(0);

  /* useEffect(()=>{
    setCurrentState(1);
     onAuthStateChanged(auth, async (user)=>{

        if(user){
            const isRegistered = await userExists(user.uid);
            if(isRegistered){
                //Todo : redirigir a Dashboard
                Navigate('/dashboard');
              setCurrentState(2);
            }else{
                //Todo : redirigir a username
                Navigate('/register');
                setCurrentState(3);
              
            }
            
        }else{
            setCurrentState(4);
            console.log("No hay nadie autenticado...")
        }

     });
  },[Navigate]); */

  async function handleGoogleLogin() {
    const googleProvider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, googleProvider);
      console.log(res);
      // Agrega el código para redirigir al usuario después de iniciar sesión correctamente
      Navigate("/dashboard/home");
    } catch (error) {
      console.error(error);
    }
  }

 function handleUserNotRegistered(user){
    Navigate("/register");
 } 

 function handleUserNotLoggedIn(user){
    setCurrentState(4);
 } 

 /* if(state == 2){
    return <div>Estas autenticado y registrado</div>
 }

 if(state == 3){
    return <div>Estas autenticado pero no registrado</div>
 } */

 if(state === 4){
    return (
        <div className="login-page">
          <div className="login-container">
            <img src="/src/assets/sitio-web.png" alt="Logo" className="logo" />
            <h2>Iniciar sesión</h2>
            <button className="google-login-button" onClick={handleGoogleLogin}>
              <FaGoogle className="google-icon" /> Accede con Google
            </button>
          </div>
        </div>
      );
 }

 if(state === 5){
  return (
      <div className="login-page">
        <div className="login-container">
          <img src="/src/assets/sitio-web.png" alt="Logo" className="logo" />
          <h2>Iniciar sesión</h2>
          <button className="google-login-button" onClick={handleGoogleLogin}>
            <FaGoogle className="google-icon" /> Accede con Google
          </button>
        </div>
      </div>
    );
}
  
 return <AuthProvider   
    onUserLoggedIn={handleGoogleLogin}
    onUserNotRegistered={handleUserNotRegistered}
    onUserNotLoggedIn = {handleUserNotLoggedIn}>
       <div className="loading-container">
        <div className="loading-icon">
          <FaSpinner className="spinner" />
        </div>
        <div className="loading-text">Loading...</div>
      </div> 
  </AuthProvider>
 
};

export default LoginPage;

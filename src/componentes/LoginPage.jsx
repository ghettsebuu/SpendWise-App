import { GoogleAuthProvider, getAuth, signInWithRedirect, onAuthStateChanged } from 'firebase/auth';
import '../assets/LoginPage.css';
import { userExists } from '../firebase/firebase';

import { FaGoogle } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';

import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import AuthProvider from '../layouts/authProvider';

const LoginPage = () => {
  const Navigate = useNavigate();

  const [state, setCurrentState] = useState(0);

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isRegistered = await userExists(user.uid);
        if (isRegistered) {
          Navigate('/dashboard/home');
        } else {
          Navigate('/register');
        }
      } else {
        setCurrentState(4);
        console.log('No hay nadie autenticado...');
      }
    });
  }, [Navigate, auth]);

  async function handleGoogleLogin() {
    try {
      await signInWithRedirect(auth, googleProvider);
      // La redirección se gestionará automáticamente después de iniciar sesión con éxito.
    } catch (error) {
      console.error(error);
    }
  }

  function handleUserNotRegistered(user) {
    Navigate('/register');
  }

  function handleUserNotLoggedIn(user) {
    setCurrentState(4);
  }

  if (state === 4) {
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

  if (state === 5) {
    return (
      <div className="login-page">
        <div className="login-container">
          <img src="/img/sitio-web.png" alt="Logo" className="logo" />
          <h2>Iniciar sesión</h2>
          <button className="google-login-button" onClick={handleGoogleLogin}>
            <FaGoogle className="google-icon" /> Accede con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider
      onUserLoggedIn={() => {}}
      onUserNotRegistered={handleUserNotRegistered}
      onUserNotLoggedIn={handleUserNotLoggedIn}
    >
      <div className="loading-container">
        <div className="loading-icon">
          <FaSpinner className="spinner" />
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </AuthProvider> 
  );
};

export default LoginPage;

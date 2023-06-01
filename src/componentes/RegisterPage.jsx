import '../assets/RegisterPage.css';

import { FaGoogle } from 'react-icons/fa';
import AuthProvider from '../layouts/authProvider';
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { existsUsername, updateUser } from '../firebase/firebase';

const RegisterPage = () => {

  const Navigate = useNavigate();
  const [state, setState] = useState(0);


  const [currentUser, setCurrentUser] = useState({});
  const [username, setUsername] = useState("");

  function handleGoogleLogin(user) {
    Navigate("/dashboard/home");
  }

  function handleUserNotRegistered(user) {
    setCurrentUser(user);
    setState(3);
  }

  function handleUserNotLoggedIn(user) {
    Navigate("/login");
  }

  function handleInputUsername(e) {
    setUsername(e.target.value);
  }

  async function handleContinue() {
    if (username !== "") {
      const exists = await existsUsername(username);
      if (exists) {
        setState(5);
      } else {
        const tmp = { ...currentUser };
        tmp.username = username;
        tmp.processCompleted = true;
        await updateUser(tmp);
        setState(6);
      }
    }
  }

  if (state === 3 || state === 5) {
    return (
      <div className="containerR">
        <h1>¡Hola , {currentUser.displayName}!</h1>
        <p>Elige un nombre de usuario</p>
        {state === 5 && <p>El nombre de usuario ya existe, escoge otro</p>}
        <div className="input-container">
          <input type="text" onChange={handleInputUsername} />
        </div>
        <div className="button-container">
          <button onClick={handleContinue}>Continuar</button>
        </div>
      </div>
    );
  }

  if (state === 6) {
    return (
      <div className="containerR">
        <h1>¡Bienvenido a SpendWise!</h1>
        <Link className="LinkRegister" to="/dashboard/home">Continuar</Link>
      </div>
    );
  }

  return (
    <AuthProvider
      onUserLoggedIn={handleGoogleLogin}
      onUserNotRegistered={handleUserNotRegistered}
      onUserNotLoggedIn={handleUserNotLoggedIn}
    />
  );
};

export default RegisterPage;

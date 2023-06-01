import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className='cont'>
      <h2>Bienvenido a la página de inicio</h2>
      <p>Contenido de la página de inicio</p>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, query, where, onSnapshot, getDoc } from 'firebase/firestore';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import '../assets/Home.css';

const Home = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    onMessage(messaging, (message) => {
      console.log('Tu mensaje:', message);
      if (!message.notification?.click_action) {
        toast(message.notification.title);
      }
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'recordatorios'), where('userId', '==', user.uid)),
        (snapshot) => {
          const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRecordatorios(datos);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (recordatorios.length > 0) {
      notificacion();
    }
  }, [recordatorios]);

  const notificacion = () => {
    const today = new Date();
    const hoy = today.toISOString().split('T')[0];

    recordatorios.forEach((recordatorio) => {
      if (recordatorio.fecha === hoy && !recordatorio.realizado) {
        toast('¡No lo olvides! Hoy debes... ' + recordatorio.descripcion);
      }
    });
  };

  const handleOpenModal = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'configuracion', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { monedaPredeterminada } = docSnap.data();
        setSelectedCurrency(monedaPredeterminada);
      }
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSetCurrency = async () => {
    if (selectedCurrency) {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(collection(db, 'configuracion'), user.uid);
        const userData = {
          userId: user.uid,
          monedaPredeterminada: selectedCurrency
        };
        try {
          const confirmed = window.confirm('¿Estás seguro de guardar los cambios?');
          if (confirmed) {
            await setDoc(userRef, userData, { merge: true });
            setDefaultCurrency(selectedCurrency);
            setModalVisible(false);
            toast.success('Moneda establecida correctamente');
          }
        } catch (error) {
          console.log(error);
          toast.error('Error al establecer la moneda');
        }
      }
    }
  };
  

  return (
    <div className="cont">
      <div className="menu">
        <FontAwesomeIcon icon={faCog} onClick={() => setMenuVisible(!menuVisible)} />
        {menuVisible && (
          <div className="dropdown-menu">
            <ul>
              <li>Perfil</li>
              <li onClick={handleOpenModal}>Moneda</li>
              <li>Color</li>
            </ul>
          </div>
        )}
      </div>
      <h2 className="title">Bienvenido a la página de inicio</h2>
      <p>Contenido de la página de inicio</p>

      {modalVisible && (
        <div className="modal-h">
          <h3>{selectedCurrency ? 'Editar Moneda Predeterminada' : 'Moneda Predeterminada'}</h3>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="">Selecciona una moneda</option>
            <option value="BS">BS</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <div>
            <button onClick={handleSetCurrency}>{selectedCurrency ? 'Editar' : 'Establecer'}</button>
            <button onClick={handleCloseModal}>Cancelar</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Home;

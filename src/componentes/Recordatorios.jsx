import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash , faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Messaging from '../firebase/messaging';

import '../assets/Recordatorios.css';

Modal.setAppElement('#root');

const Recordatorios = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState({
    descripcion: '',
    fecha: '',
    realizado: false // Added field
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [recordatorioEliminar, setRecordatorioEliminar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'recordatorios'), where('userId', '==', user.uid)),
        (snapshot) => {
          const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRecordatorios(datos);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  const handleAgregarRecordatorio = async () => {
    const user = auth.currentUser;
    if (user) {
      const recordatorio = {
        userId: user.uid,
        descripcion: nuevoRecordatorio.descripcion,
        fecha: nuevoRecordatorio.fecha,
        creadoEn: serverTimestamp(),
        realizado: false // Added field
      };

      try {
        const docRef = await addDoc(collection(db, 'recordatorios'), recordatorio);
        setRecordatorios([...recordatorios, { id: docRef.id, ...recordatorio }]);
        setNuevoRecordatorio({ descripcion: '',  fecha: '' });
        closeModal();
        toast.success('Recordatorio agregado correctamente');
      } catch (error) {
        console.error('Error al agregar el recordatorio:', error);
        toast.error('Error al agregar el recordatorio');
      }
    }
  };

  

  const handleEliminarRecordatorio = async () => {
    const id = recordatorioEliminar.id;
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este recordatorio?');
    if (confirmar) {
      try {
        await deleteDoc(doc(db, 'recordatorios', id));
        const actualizados = recordatorios.filter((r) => r.id !== id);
        setRecordatorios(actualizados);
        closeModal();
        toast.success('Recordatorio eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el recordatorio:', error);
        toast.error('Error al eliminar el recordatorio');
      }
    }
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRecordatorioEliminar(null);
    
  };

  const handleConfirmarEliminar = (recordatorio) => {
    setRecordatorioEliminar(recordatorio);
    handleEliminarRecordatorio(); // Llamar a handleEliminarRecordatorio después de actualizar el estado
  };

  const handleMarcarRealizado = async (recordatorio) => {
    const id = recordatorio.id;
    const confirmar = window.confirm('¿Estás seguro de que deseas marcar este recordatorio como realizado?');
    if (confirmar) {
      const updatedRecordatorio = { ...recordatorio, realizado: true };
  
      try {
        await setDoc(doc(db, 'recordatorios', id), updatedRecordatorio);
        const actualizados = recordatorios.map((r) => (r.id === id ? updatedRecordatorio : r));
        setRecordatorios(actualizados);
        toast.success('Recordatorio marcado como realizado');
      } catch (error) {
        console.error('Error al marcar el recordatorio como realizado:', error);
        toast.error('Error al marcar el recordatorio como realizado');
      }
    }
  };
  

  return (
    <div className="cont">
      <h2 className="title">Módulo de Recordatorios</h2>

      <button onClick={openModal} className="addButton">Agregar Recordatorio</button>

      {isLoading ? (
      <div className="loading-cont">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <div className="loadingtext">Cargando Recordatorios...</div>
      </div>
      ) : (
        <>
          {recordatorios.length === 0 ? (
            <div className='no-gastos'>
              <p>Aún no hay recordatorios añadidos.</p>
            </div>
            
          ) : (
            <div className='contenedor-recordatorios' style={{ maxHeight: '270px', overflowY: 'auto' }}>
              <ul className="recordatorios-list">
                {recordatorios.map((recordatorio) => (
                  <li key={recordatorio.id} className={`recordatorio-item ${recordatorio.realizado ? 'realizado' : ''}`}>
                    <span>{recordatorio.descripcion}</span>
                    <div className='separarIconos'>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        onClick={() => handleMarcarRealizado(recordatorio)}
                        className={`recordatorio-item-btnR ${recordatorio.realizado ? 'realizado' : ''}`}
                      />

                      <FontAwesomeIcon
                        icon={faTrash}
                        onClick={() => handleConfirmarEliminar(recordatorio)}
                        className="recordatorio-item-btn"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          )}
        </>
      )}
      <Messaging />

      <Modal isOpen={modalOpen} onRequestClose={closeModal} appElement={document.getElementById('root')} className="modal" overlayClassName="overlay">
      <>
        <h3 className='modalTitle'>Agregar Recordatorio</h3>
        <form>
              <input
                type="text"
                value={nuevoRecordatorio.descripcion}
                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, descripcion: e.target.value })}
                placeholder="Descripción"
                className="agregar-recordatorio-input"
              />
             
              <input
                type="date"
                value={nuevoRecordatorio.fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, fecha: e.target.value })}
                placeholder="Fecha"
                className="agregar-recordatorio-input"
              />
              <button type="button" onClick={handleAgregarRecordatorio} className="agregar-recordatorio-btn">Agregar</button>
              <button type="button" onClick={closeModal} className="agregar-recordatorio-btn">Cancelar</button>
            </form>
      </>
    </Modal>
    </div>
  );
};

export default Recordatorios;

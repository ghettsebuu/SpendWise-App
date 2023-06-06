import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
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
    frecuencia: '',
    fecha: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [recordatorioEliminar, setRecordatorioEliminar] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

   console.log(user);
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

 


  
  const handleAgregarRecordatorio = async () => {
    const user = auth.currentUser;
    if (user) {
      const recordatorio = {
        userId: user.uid,
        descripcion: nuevoRecordatorio.descripcion,
        frecuencia: nuevoRecordatorio.frecuencia,
        fecha: nuevoRecordatorio.fecha,
        creadoEn: serverTimestamp(),
      };

      try {
        const docRef = await addDoc(collection(db, 'recordatorios'), recordatorio);
        setRecordatorios([...recordatorios, { id: docRef.id, ...recordatorio }]);
        setNuevoRecordatorio({ descripcion: '', fecha: '' });
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
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRecordatorioEliminar(null);
    setConfirmarEliminar(false);
  };

  const handleConfirmarEliminar = (recordatorio) => {
    setRecordatorioEliminar(recordatorio);
    setConfirmarEliminar(true);
    setModalOpen(true);
  };
  // notificacion()
  return (
    <div className="cont">
      <h2 className="recordatorios-heading">Recordatorios</h2>

      <button onClick={openModal} className="agregar-recordatorio-btn">Agregar Recordatorio</button>

      <ul className="recordatorios-list">
        {recordatorios.map((recordatorio) => (
          <li key={recordatorio.id} className="recordatorio-item">
            <span>{recordatorio.descripcion}</span>
            
            <button onClick={() => handleConfirmarEliminar(recordatorio)} className="recordatorio-item-btn">Eliminar</button>
          </li>
        ))}
      </ul>
        
      <Messaging />

      <Modal isOpen={modalOpen} onRequestClose={closeModal} appElement={document.getElementById('root')} className="modal" overlayClassName="overlay">
        {confirmarEliminar ? (
          <>
            <h3>Eliminar Recordatorio</h3>
            <p>¿Estás seguro de que deseas eliminar este recordatorio?</p>
            <button type="button" onClick={handleEliminarRecordatorio} className="eliminar-recordatorio-btn">Eliminar</button>
            <button type="button" onClick={closeModal} className="eliminar-recordatorio-btn">Cancelar</button>
          </>
        ) : (
          <>
            <h3>Agregar Recordatorio</h3>
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
        )}
      </Modal>
    </div>
  );
};

export default Recordatorios;
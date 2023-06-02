import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { collection, addDoc, updateDoc, doc, onSnapshot, getDocs, deleteDoc, query, where,setDoc  } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/Presupuesto.css';

const Presupuesto = () => {
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [periodo, setPeriodo] = useState('día');
  const [presupuestoId, setPresupuestoId] = useState(null); // Nuevo estado para almacenar el ID del presupuesto actual
  const [presupuestos, setPresupuestos] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        const q = query(collection(db, 'presupuesto'), where('userId', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => { // Usamos la consulta "q" para obtener solo los presupuestos del usuario actual
          const data = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          if (data.length > 0) {
            setPresupuestoId(data[0].id); // Almacenamos el ID del presupuesto actual en el estado
          }
          setPresupuestos(data);
        });
        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (presupuesto) => {
    setModalIsOpen(true);
    setMonto(presupuesto.monto);
    setMoneda(presupuesto.moneda);
    setPeriodo(presupuesto.periodo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const nuevoPresupuesto = {
      userId: user.uid,
      monto,
      moneda,
      periodo,
    };
  
    try {
      if (presupuestoId) {
        await setDoc(doc(db, 'presupuesto', presupuestoId), nuevoPresupuesto); // Utilizar setDoc en lugar de updateDoc
        setModalIsOpen(false);
        toast.success('¡Presupuesto actualizado correctamente!');
      } else {
        await addDoc(collection(db, 'presupuesto'), nuevoPresupuesto);
        setModalIsOpen(false);
        toast.success('¡Presupuesto agregado correctamente!');
      }
    } catch (error) {
      console.error('Error al guardar el presupuesto:', error);
      toast.error('Ocurrió un error al guardar el presupuesto.');
    }
  };
  

  const deletePresupuesto = async (presupuestoId) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este presupuesto?');
  
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'presupuesto', presupuestoId));
        toast.success('¡Presupuesto eliminado correctamente!');
      } catch (error) {
        console.error('Error al eliminar el presupuesto:', error);
        toast.error('Ocurrió un error al eliminar el presupuesto.');
      }
    }
  };
  
  return (
    <div className="cont">
      <h2 className="title">Módulo de Presupuesto</h2>

      {presupuestos.length > 0 ? (
        presupuestos.map((presupuesto) => (
          <div className="card" key={presupuesto.userId}>
            <h3 className="card-title">Tu presupuesto actual:</h3>
            <p>Monto: {presupuesto.monto}</p>
            <p>Moneda: {presupuesto.moneda}</p>
            <p>Periodo: {presupuesto.periodo}</p>
            <div className='botonesCard'>
              <button className="editButton" onClick={() => handleEdit(presupuesto)}>Editar Presupuesto</button>
              <button className="deleteButton" onClick={() => deletePresupuesto(presupuesto.id)}>Eliminar Presupuesto</button>
            </div>
            
          </div>
        ))
      ) : (
        <div className="no-presupuesto">
          <p>No tienes un presupuesto asignado.</p>
          <button className="addButton" onClick={() => setModalIsOpen(true)}>Agregar Presupuesto</button>
        
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Agregar/Editar Presupuesto"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>{presupuestos.length > 0 ? 'Editar Presupuesto' : 'Agregar Presupuesto'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Monto:
            <input
              type="number"
              name="monto"
              className="input"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </label>
          <label>
            Moneda:
            <select
              name="moneda"
              className="input"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              required
            >
              <option value="USD">USD</option>
              <option value="BS">BS</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label>
            Periodo:
            <select
              name="periodo"
              className="input"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              required
            >
              <option value="día">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </label>
          <button className="saveButton" type="submit">
            {presupuestos.length > 0 ? 'Actualizar Presupuesto' : 'Agregar Presupuesto'}
          </button>
          
        </form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Presupuesto;
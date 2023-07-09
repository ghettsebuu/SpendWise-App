import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { collection, addDoc, updateDoc, doc, onSnapshot, getDocs, deleteDoc, query, where, setDoc } from 'firebase/firestore';
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
  const [presupuestoId, setPresupuestoId] = useState(null);
  const [presupuestos, setPresupuestos] = useState([]);
  const [monedaPredeterminada, setMonedaPredeterminada] = useState('');
 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        const configQuery = query(collection(db, 'configuracion'), where('userId', '==', user.uid));
        const q = query(collection(db, 'presupuesto'), where('userId', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const data = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          if (data.length > 0) {
            setPresupuestoId(data[0].id);
          }
          setPresupuestos(data);
        });

        const unsubscribeConfigSnapshot = onSnapshot(configQuery, (configSnapshot) => {
          configSnapshot.forEach((configDoc) => {
            const configData = configDoc.data();
            setMonedaPredeterminada(configData.monedaPredeterminada);
          });
        });

        return () => {
          unsubscribeSnapshot();
          unsubscribeConfigSnapshot();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (presupuesto) => {
    setModalIsOpen(true);
    setMonto(presupuesto.monto);
    setMoneda(presupuesto.moneda);
    // setPeriodo(presupuesto.periodo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const fecha = new Date();

    if (!monedaPredeterminada) {
      toast.error('Debe establecer una moneda antes de agregar un presupuesto. Vaya al modulo de Usuario y seleccione la moneda en el panel de configuración');
      return;
    }

    const nuevoPresupuesto = {
      userId: user.uid,
      monto: parseFloat(monto),
      moneda,
      // periodo,
      presupuestoActual: parseFloat(monto),
      fecha: fecha.toISOString(),
    };

    try {
      if (presupuestoId) {
        await setDoc(doc(db, 'presupuesto', presupuestoId), nuevoPresupuesto);
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

  const handleMontoChange = (e) => {
    const value = e.target.value;
    if (value < 0) {
      // Valor negativo detectado, no se actualiza el estado
      return;
    }
    setMonto(value);
  };

  return (
    <div className="cont">
      <h2 className="title">Módulo de Presupuesto</h2>

      {presupuestos.length > 0 ? (
        presupuestos.map((presupuesto) => (
        <div className="card" key={presupuesto.userId}>
          <div className='card-presu'>
            <div className='cont-presu'>
              <div className='monto'>
                <p className='parrafos-p'>{presupuesto.monto}</p>
              </div>
              <div className='moneda'>
                <p className='parrafos-p'>{monedaPredeterminada}</p>
              </div>
            </div>
            <div className='fecha'>
              <p className='parrafos-p'>Fecha: {new Date(presupuesto.fecha).toLocaleDateString()}</p>
            </div>

           {/*  <div className='periodo'>
              <p className='parrafos-p'>Periodo: {presupuesto.periodo}</p>
            </div> */}

            <div className='botonesCard'>
              <FontAwesomeIcon className="editButton" icon={faEdit} onClick={() => handleEdit(presupuesto)} />
              <FontAwesomeIcon className="deleteButton" icon={faTrash} onClick={() => deletePresupuesto(presupuesto.id)} />
            </div>
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
        <h2 className='modalTitle'>{presupuestos.length > 0 ? 'Editar Presupuesto' : 'Agregar Presupuesto'}</h2>
        <form onSubmit={handleSubmit}>
        <label>
          Monto:
          <input
            type="number"
            name="monto"
            className="input"
            value={monto}
            onChange={handleMontoChange}
            required
          />
        </label>
          <label>
            Moneda:
            <input
              type="text"
              className="input"
              value={monedaPredeterminada}
              readOnly
            />
          </label>
          {/* <label>
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
          </label> */}
          <button className="saveButton-p" type="submit">
            {presupuestos.length > 0 ? 'Actualizar Presupuesto' : 'Agregar Presupuesto'}
          </button>
        </form>
      </Modal>

      
    </div>
  );
};

export default Presupuesto;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { onMessage } from 'firebase/messaging';
import {addDoc,collection,deleteDoc,doc,getDocs,serverTimestamp,setDoc,query,where,onSnapshot,getDoc,} from 'firebase/firestore';
import { messaging } from '../firebase/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { faMoneyCheckDollar} from '@fortawesome/free-solid-svg-icons';

import { faCog } from '@fortawesome/free-solid-svg-icons';
import '../assets/Home.css';

const Home = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');
  const [totalGastos, setTotalGastos] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [weeklyExpenses, setWeeklyExpenses] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [presupuestoActual, setPresupuestoActual] = useState(0);
  const [pendientes, setPendientes] = useState([]);



  /* useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]); */

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
          const datos = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
              const fechaA = new Date(a.fecha);
              const fechaB = new Date(b.fecha);
              return fechaA - fechaB;
            });
          setRecordatorios(datos);
  
          const pendientesProximos = datos.filter((recordatorio) => {
            const fechaRecordatorio = new Date(recordatorio.fecha);
            const fechaActual = new Date();
            return fechaRecordatorio >= fechaActual && !recordatorio.realizado;
          });
          setPendientes(pendientesProximos);
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

 
  useEffect(() => {
    const user = auth.currentUser;
  
    const fetchData = async () => {
      if (user) {
        const unsubscribeGastos = onSnapshot(
          query(collection(db, 'gastos'), where('userId', '==', user.uid)),
          (snapshot) => {
            const gastos = snapshot.docs.map((doc) => doc.data());
            setGastos(gastos);
  
            const categorias = obtenerCategorias(gastos);
            setCategorias(categorias);
  
            const total = gastos.reduce((accumulator, current) => accumulator + current.monto, 0);
            setTotalGastos(total);
  
            const weeklyExpenses = getWeeklyExpenses(gastos);
            setWeeklyExpenses(weeklyExpenses);
          }
        );
  
        const docRef = doc(db, 'configuracion', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { monedaPredeterminada } = docSnap.data();
          setDefaultCurrency(monedaPredeterminada);
          if (monedaPredeterminada) {
            setCurrencySymbol(getCurrencySymbol(monedaPredeterminada));
          }
        }
  
        return () => {
          unsubscribeGastos();
          // unsubscribePresupuesto();
        };
      }
    };
  
    fetchData();
  }, []);
  

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'BS':
        return 'BS';
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      default:
        return '';
    }
  };

  const obtenerCategorias = (gastos) => {
    const categorias = {};
    gastos.forEach((gasto) => {
      if (gasto.categoria in categorias) {
        categorias[gasto.categoria]++;
      } else {
        categorias[gasto.categoria] = 1;
      }
    });
    const categoriasOrdenadas = Object.entries(categorias).sort((a, b) => b[1] - a[1]);
    return categoriasOrdenadas;
  };

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
          monedaPredeterminada: selectedCurrency,
        };

        // Obtener gastos del usuario
        const gastosSnapshot = await getDocs(
          query(collection(db, 'gastos'), where('userId', '==', user.uid))
        );

        if (gastosSnapshot.empty) {
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
        } else {
          toast.error('No puedes modificar la moneda predeterminada si ya tienes gastos agregados');
        }
      }
    }
  };

  const handleCardClick = () => {
    navigate('/dashboard/informes');
  };

  const getWeeklyExpenses = (gastos) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(today.getDate() - today.getDay());
  
    const endOfWeek = new Date(today);
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  
    const weeklyExpenses = gastos.filter((gasto) => {
      const fecha = gasto.fecha instanceof Date ? gasto.fecha : new Date(gasto.fecha);
      return fecha >= startOfWeek && fecha <= endOfWeek;
    });
  
    return weeklyExpenses.reduce((total, gasto) => total + gasto.monto, 0);
  };
  
  const totalGastosSemanales = getWeeklyExpenses(gastos);

  return (
    <div className="cont">
      <div className="menu">
        <FontAwesomeIcon
          icon={faCog}
          onClick={() => setMenuVisible(!menuVisible)}
          title="Panel de configuración"
        />
        {menuVisible && (
          <div className="dropdown-menu">
            <ul>
              <li onClick={handleOpenModal}>Moneda</li>
              <li>Color</li>
            </ul>
          </div>
        )}
      </div>
      <h2 className="title">Módulo de Inicio</h2>

      <div className="card">
       <div className='contenido'>
          <div
              className="card-top-categorias"
              onClick={handleCardClick}
              title="Clic para ir a informes"
            >
              <div className="title-top">
                <h3>Top de categorías</h3>
              </div>
              {categorias.length > 0 ? (
                categorias.map(([categoria, cantidad], index) => (
                  <div className="categorias" key={categoria}>
                    <span className="span-numeracion">{index + 1}.</span>
                    <span className="span-categoria">{categoria}</span>
                    <progress
                      className="progreso"
                      value={cantidad}
                      max={categorias[0][1]}
                    ></progress>
                  </div>
                ))
              ) : (
                <div className="no-categorias">No hay categorías aún...</div>
              )}
            </div>
        
          </div>
            <div className="card-top-gastos">
                <div className="title-top">
                  <h3>Total de gastos agregados</h3>
                </div>
                <div className="total-gastos">
                  <span className="icon">
                  <FontAwesomeIcon icon={faMoneyCheckDollar} />
                  </span>
                  {totalGastos} {currencySymbol}
                </div>
            </div>

            <div className="card-semana">
              <div className="title-top">
                <h3>Gasto de la semana </h3>
              </div>
              <div className="total-gastos-semana">
                <span className="icon">
                  <FontAwesomeIcon icon={faCoins} />
                </span>
                {totalGastosSemanales} {currencySymbol}
              </div>
           </div>

          <div className="contenedor-pendientes">
            <div className='title-top'>
              <h3 >Próximos pendientes </h3>
            </div>
            
            <div className='contenedor-listaP'>
            {pendientes.length > 0 ? (
            
                <ul>
                  {pendientes.map((pendiente) => (
                    <li key={pendiente.id}>{pendiente.descripcion}</li>
                  ))}
                </ul>
              
            ) : (

              <p className='no-pendientes'>No hay pendientes .</p>
            )}
          </div>
        </div>
       
      </div>


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
            <button onClick={handleSetCurrency}>
              {selectedCurrency ? 'Editar' : 'Establecer'}
            </button>
            <button onClick={handleCloseModal}>Cancelar</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Home;

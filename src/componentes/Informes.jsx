import '../assets/Informes.css';
import { PieChart, Pie, Sector, Cell } from "recharts";
import React, { useState, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import ReactEcharts from 'echarts-for-react';
import Chart from "react-apexcharts";
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

const Informes = () => {
  const [informe, setInforme] = useState([]);
  const [datoss, setDatoss] = useState([]);
  const [total, setTotal] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("0");
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [labels, setLabels] = useState([]);
  const [monedaPredeterminada, setMonedaPredeterminada] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsLoading(true);

      const unsubscribe = onSnapshot(
        query(
          collection(db, 'gastos'),
          where('userId', '==', user.uid),
        ),
        async (snapshot) => {
          const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          if (datos && datos.length > 0) {
            const gastos = datos.map((data) => ({ name: data.categoria, value: data.monto }));

            const ordenado = gastos.reduce((accumulator, item) => {
              const existingItem = accumulator.find(i => i.name === item.name);
              if (existingItem) {
                existingItem.value += item.value;
              } else {
                accumulator.push({ name: item.name, value: item.value });
              }
              return accumulator;
            }, []);

            const suma = ordenado.reduce((total, dato) => total + dato.value, 0);
            setInforme(ordenado);
            setTotal(suma);

            const uniqueLabels = Array.from(new Set(datos.map(dato => dato.categoria)));
            setLabels(uniqueLabels);

            const datosFiltradosOrdenados = datos.reduce((accumulator, item) => {
              const existingItem = accumulator.find(i => i.categoria === item.categoria);
              if (existingItem) {
                existingItem.monto += item.monto;
              } else {
                accumulator.push({ categoria: item.categoria, monto: item.monto });
              }
              return accumulator;
            }, []);
            setDatosFiltrados(datosFiltradosOrdenados);
          } else {
            setInforme([]);
            setTotal(0);
            setLabels([]);
            setDatosFiltrados([]);
          }

          setDatoss(datos);
          setIsLoading(false);
        }
      );

      const getConfiguracion = async () => {
        const configRef = doc(db, 'configuracion', user.uid);
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const configuracionData = configSnap.data();
          setMonedaPredeterminada(configuracionData.monedaPredeterminada);
        }
      };
      getConfiguracion();

      return () => unsubscribe();
    }
  }, []);

  const handleMesSeleccionado = (event) => {
    const mes = event.target.value;
    setMesSeleccionado(mes);
  };

  useEffect(() => {
    const datosFiltrados = mesSeleccionado !== "0" ? datoss.filter(data => new Date(data.fecha).getMonth() === parseInt(mesSeleccionado) - 1) : datoss;

    const uniqueLabels = Array.from(new Set(datosFiltrados.map(dato => dato.categoria)));
    setLabels(uniqueLabels);

    const datosFiltradosOrdenados = datosFiltrados.reduce((accumulator, item) => {
      const existingItem = accumulator.find(i => i.categoria === item.categoria);
      if (existingItem) {
        existingItem.monto += item.monto;
      } else {
        accumulator.push({ categoria: item.categoria, monto: item.monto });
      }
      return accumulator;
    }, []);

    setDatosFiltrados(datosFiltradosOrdenados);
  }, [mesSeleccionado, datoss]);


  const opciones = {
    options: {
      chart: {
        width: 380,
        type: 'pie',
      },
      name: {
        show: false
      },
      labels: labels,
      responsive: [{
        breakpoint: 380,
        options: {
          chart: {
            width: 380
          },
          legend: {
            position: 'bottom'
          },
          fill: {
            type: 'gradient',
          }
        }
      }]
    },
  };

  return (
    <div className="cont">
      <div className="menuflex">

      <h2 className="title">Módulo de Informes</h2>
      <div className='menu-mes'>
        <select value={mesSeleccionado} onChange={handleMesSeleccionado}>
          <option value="0">Todos los meses</option>
          <option value="1">Enero</option>
          <option value="2">Febrero</option>
          <option value="3">Marzo</option>
          <option value="4">Abril</option>
          <option value="5">Mayo</option>
          <option value="6">Junio</option>
          <option value="7">Julio</option>
          <option value="8">Agosto</option>
          <option value="9">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </select>
      </div>
      </div>
     {/*  {isLoading ? (
        <div className="loading-cont-Informe">
          <div className="loading-bar">
              <div className="loading-progress"></div>
          </div>
          <div className="loadingtext">Cargando Datos...</div>
       </div>
      ) : ( */}
        <div className="Informes">
          <div className="flexinforme">


            <div className="tabla-informes">
              <div className='title-info'>
                <span>Total de gastos por categoría</span>
              </div>
              <Table className='table-info' striped bordered hover variant="dark">
                <thead className='tabla-cabecera'>
                  <tr>
                    <th>Categorías</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody className='tabla-cuerpo'>
                  {datosFiltrados && datosFiltrados.length > 0 ? (
                    datosFiltrados.map((dato, index) => (
                      <tr key={index}>
                        <td>{dato.categoria}</td>
                        <td>{dato.monto} {monedaPredeterminada}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2"> No hay datos disponibles este mes</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          <div className="graficaFlex">

          <div className="grafica">
            {datosFiltrados && datosFiltrados.length > 0 ? (
              <Chart
                className="torta"
                options={opciones.options}
                series={datosFiltrados.map(item => item.monto)}
                type="pie"
                width={380}
              />
            ) : (
              <div className="no-datos-mensaje">No hay datos disponibles para la gráfica</div>
            )}
               <div className='TOTAL'>
            <h4>Total de gastos : {datosFiltrados.reduce((total, dato) => total + dato.monto, 0)} {monedaPredeterminada}</h4>
          </div>
          </div>
          </div>
          
        </div>
      {/* )} */}
     
  
    </div>
  );
};

export default Informes;

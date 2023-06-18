import '../assets/Informes.css';
import { PieChart, Pie, Sector, Cell } from "recharts";
import React, { useState, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import ReactEcharts from 'echarts-for-react';
import Chart from "react-apexcharts";
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';


const Informes = () => {

  const [informe, setInforme] = useState([]);
  const [datoss, setDatoss] = useState();
  const [total, setTotal] = useState();
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'gastos'), where('userId', '==', user.uid)),
        async (snapshot) => {
          const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          if (datos && datos.length > 0) {
            const gastos = datos.map((data) => ({ name: data.categoria, value: data.monto }))
        
        
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
          console.log(suma)
            setInforme(ordenado);
            setTotal(suma)
          }
          setDatoss(datos)
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, []);


  console.log(informe)

  


 const opciones = {
          
    
    options: { 
          chart: {
        width: 1000,
        type: 'pie',
      },   name: {
        show: false
      }, 
      labels: ['Entretenimiento', 'Alquiler', 'Servicios', 'Alimentos', 'Transporte'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
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


  return <div className="cont">
    <div className="gasto">
                  <div className="tabla">
                    <span>Total de gastos por categoria</span>
              <Table striped bordered hover variant="dark">
                  <thead>
                    <tr>

                      <th>Categorias</th>
                      <th>Total</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                  {informe && informe.length >0 ?
                  informe.map((dato, index) => (
                    <tr key={index}>
                    <td>{dato.name}</td>
                    <td>{dato.value}</td>
                  </tr>
                  ))
            
                :(
                  <tr>
                    <td colSpan="2">No hay datos disponibles.</td>
                  </tr>
                )}
                </tbody>
            </Table>
            
              </div>  
            <div className="grafica">
            <Chart options={opciones.options} series={informe.map(item => item.value)} type="pie" width={380} />

            </div>
    </div>
       <h4 className='TOTAL'>Total gastado del mes : {total}</h4>
    <div>
 
    
    </div>
 
 {/* {  informe && informe.length >0 ? 
  <ReactEcharts
      option={options}
      style={{ width: "600px", height: "300px" }}
    >

    </ReactEcharts>

: <div>hola </div>} */}
    </div>


};

export default Informes;

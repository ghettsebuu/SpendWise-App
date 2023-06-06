import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth,db } from '../firebase/firebase';
import {getToken, onMessage} from "firebase/messaging";
import {messaging} from "../firebase/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, query, where, onSnapshot } from 'firebase/firestore';

import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Home = () => {
  const [recordatorios, setRecordatorios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  
  
  useEffect(()=>{
    onMessage(messaging, message=>{
      console.log("tu mensaje:", message);
      toast(message.notification.title);
    
    
    })
    
    
    }, []);

    //-----------------------------------------------

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
  
    useEffect(()=>{

      if(recordatorios > []){
        console.log(recordatorios)
  
        notificacion()
       }
    },[recordatorios])
  
  
  
    const notificacion =()=>{
      
      const today = new Date();
      parseInt(today.getMonth()+1)
      const hoy = today.getFullYear() + "-"+"0"+ parseInt(today.getMonth()+1)+"-"+ "0"+today.getDate() ;
  
  
     
  
      recordatorios.map((recordatorio) => {
        console.log('firebase', recordatorio.fecha,'hoy',hoy)
        if(recordatorio.fecha === hoy){
          return toast.warning(recordatorio.descripcion);
        }
      
      }
        
      )
  
    }


//----------------------------------------------------
  const activarMensajes = async ()=> {
    const token = await getToken(messaging,{
      vapidKey: "BMCok6yksLsYVIzc8ZGvQ0Um2B-nHBgFmlnrfPT74rNLHyoeUBRYZw54q83_n2uN1K7Yu7rrdEsan5PNAkVPHnw"
    }).catch(error => console.log("Tuviste un error al generar el token, papá"));
  
  
    if(token) console.log("tu token:",token);
    if(!token) console.log("no tienes token, rey");
  }

  

  return (
    <div className='cont'>
      <h2>Bienvenido a la página de inicio</h2>
      <p>Contenido de la página de inicio</p>
      <button onClick={activarMensajes}>mensaje
      </button>
    </div>
  );
};

export default Home;

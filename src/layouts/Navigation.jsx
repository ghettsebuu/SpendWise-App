import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import '../assets/Navigation.css';

const Navigation = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dateText, setDateText] = useState('');
  const [dateNumber, setDateNumber] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateYear, setDateYear] = useState('');
  const [username, setUsername] = useState('');

  const location = useLocation();
  const db = getFirestore();

  useEffect(() => {
    mostrarFechaActual();
    restoreActiveIndex();
    fetchUsername();
  }, []);

  useEffect(() => {
    saveActiveIndex();
  }, [activeIndex]);

  function mostrarFechaActual() {
    const date = new Date();
    const options = { weekday: 'long' };

    setDateText(date.toLocaleDateString('es-ES', options));
    setDateNumber(date.getDate());
    setDateMonth(date.toLocaleString('es-ES', { month: 'short' }));
    setDateYear(date.getFullYear());
  }

  async function fetchUsername() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUsername(userData.username);
      }
    }
  }

  function saveActiveIndex() {
    localStorage.setItem('activeIndex', JSON.stringify(activeIndex));
  }

  function restoreActiveIndex() {
    const savedActiveIndex = localStorage.getItem('activeIndex');
    const parsedActiveIndex = savedActiveIndex ? JSON.parse(savedActiveIndex) : 0;

    setActiveIndex(parsedActiveIndex);
  }

  const handleItemClick = (index) => {
    setActiveIndex(index);
  };

  const navItems = [
    { icon: 'home-outline', text: 'Inicio', path: '/dashboard/home' },
    { icon: 'wallet-outline', text: 'Gastos', path: '/dashboard/gastos' },
    { icon: 'calendar-outline', text: 'Recordatorios', path: '/dashboard/recordatorios' },
    { icon: 'cash-outline', text: 'Presupuesto', path: '/dashboard/presupuesto' },
    { icon: 'bar-chart-outline', text: 'Informes', path: '/dashboard/informes' },
    { icon: 'log-in-outline', text: 'Logout', path: '/dashboard/logout' },
  ];

  useEffect(() => {
    const currentNavItem = navItems.findIndex((item) => item.path === location.pathname);
    if (currentNavItem !== -1) {
      setActiveIndex(currentNavItem);
    }
  }, [location.pathname]);

  return (
    <>
      <div className="cajonbody">
        <div className="navigat">
          <ul>
            {navItems.map((item, index) => (
              <li
                key={index}
                className={`list ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleItemClick(index)}
              >
                <NavLink to={item.path}>
                  <span className="icon">
                    <ion-icon name={item.icon}></ion-icon>
                  </span>
                  <span className="text">{item.text}</span>
                </NavLink>
              </li>
            ))}
            <div className="indicator"></div>
          </ul>
        </div>

        <section className="cajasection">
          <div className="date">
            <div className="dateRight">
              <div className='dateNumber'>{dateNumber}</div>
              <div>
                <div className='dateMonth'>{dateMonth}</div>
                <div className='dateYear'>{dateYear}</div>
              </div>
            </div> 
            <div className='username-text'>
              <div className="username">{username}</div> {/* Nuevo elemento para mostrar el username */}
              <div className='dateText'>{dateText}</div>
            </div>
            
          </div>
          
          <Outlet></Outlet>
        </section>
      </div>
    </>
  );
};

export default Navigation;

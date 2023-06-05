import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../assets/Navigation.css';

const Navigation = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dateText, setDateText] = useState('');
  const [dateNumber, setDateNumber] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateYear, setDateYear] = useState('');

  useEffect(() => {
    mostrarFechaActual();
  }, []);

  function mostrarFechaActual() {
    const date = new Date();
    const options = { weekday: 'long' };

    setDateText(date.toLocaleDateString('es-ES', options));
    setDateNumber(date.getDate());
    setDateMonth(date.toLocaleString('es-ES', { month: 'short' }));
    setDateYear(date.getFullYear());
  }

  const handleItemClick = (index) => {
    setActiveIndex(index);
  };

  
  const navItems = [
    { icon: 'person-outline', text: 'Usuario', path: '/dashboard/home' },
    { icon: 'wallet-outline', text: 'Gastos', path: '/dashboard/gastos' },
    { icon: 'calendar-outline', text: 'Recordatorios', path: '/dashboard/recordatorios' },
    { icon: 'cash-outline', text: 'Presupuesto', path: '/dashboard/presupuesto' },
    { icon: 'bar-chart-outline', text: 'Informes', path: '/dashboard/informes' },
    { icon: 'log-in-outline', text: 'Logout', path: '' },
  ];

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
            <div className='dateText'>{dateText}</div>
          </div>
          <Outlet></Outlet>
        </section>
      </div>
    </>
  );
};

export default Navigation;

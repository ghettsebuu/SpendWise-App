import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEdit, faTrash, faFilter } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

import Modal from 'react-modal';
import { useTable, usePagination } from 'react-table';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/Gastos.css';

const Gastos = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const noHayGastos = gastos.length === 0;
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [presupuesto, setPresupuesto] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialDate, setInitialDate] = useState('');
  const [moneda, setMoneda] = useState('');
  const [monedaPredeterminada, setMonedaPredeterminada] = useState('');
  const [monto, setMonto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [showFilter, setShowFilter] = useState(false);


  useEffect(() => {
    const fetchGastos = async () => {
      const user = auth.currentUser;
      if (user) {
        // Obtener los gastos del usuario
        const q = query(collection(db, 'gastos'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const gastosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGastos(gastosData);
  
        // Obtener el presupuesto del usuario
        const presupuestoSnapshot = await getDocs(query(collection(db, 'presupuesto'), where('userId', '==', user.uid)));
        if (!presupuestoSnapshot.empty) {
          const presupuestoData = presupuestoSnapshot.docs[0].data();
          const presupuestoActual = presupuestoData.presupuestoActual;
          const moneda = presupuestoData.moneda;
          setPresupuesto({ monto: presupuestoActual, moneda });
        }
  
        // Obtener la moneda predeterminada del usuario
        const configuracionSnapshot = await getDocs(query(collection(db, 'configuracion'), where('userId', '==', user.uid)));
        if (!configuracionSnapshot.empty) {
          const configuracionData = configuracionSnapshot.docs[0].data();
          const monedaPredeterminada = configuracionData.monedaPredeterminada;
          setMonedaPredeterminada(monedaPredeterminada);
        }
      }
      setIsLoading(false);
    };

    fetchGastos();
  }, []);

  useEffect(() => {
    setMoneda(monedaPredeterminada);
  }, [monedaPredeterminada]);
  
  const filteredGastos = useMemo(() => {
    if (filtroCategoria === '') return gastos;
    return gastos.filter(gasto => gasto.categoria === filtroCategoria);
  }, [gastos, filtroCategoria]);

  const columns = useMemo(
    () => [
      {
        Header: 'Fecha',
        accessor: 'fecha',
        Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm:ss'),
      },
      {
        Header: 'Descripción',
        accessor: 'descripcion',
      },
      {
        Header: 'Monto',
        accessor: 'monto',
      },
      {
        Header: 'Moneda',
        accessor: 'moneda',
      },
      {
        Header: 'Categoría',
        accessor: 'categoria',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
  } = useTable(
    {
      columns,
      data: filteredGastos,
      initialState: { pageIndex: pageIndex, pageSize: 4 }, // Establece el tamaño de página a 4
    },
    usePagination
  );

  const handleOpenModal = (index) => {
    if ((!presupuesto || presupuesto.monto > 0) || presupuestoSnapshot !== null) {
      if (index !== null) {
        const gasto = page[index].original;
        setEditingData(gasto);
        setInitialDate(gasto.fecha);
      } else {
        setEditingData(null);
        setInitialDate(currentDate);
      }
      setModalIsOpen(true);
    } else {
      toast.warning('¡Tu presupuesto ha llegado a cero! Actualiza tu presupuesto para seguir agregando gastos.');
    }
  };
  
  const handleCloseModal = () => {
    setModalIsOpen(false);
    setEditingData(null);
  };

  const handleDelete = async (index) => {
    const gasto = page[index].original;
  
    try {
      if (window.confirm('¿Estás seguro de eliminar los datos?')) {
        const presupuestoSnapshot = await getDocs(
          query(collection(db, 'presupuesto'), where('userId', '==', gasto.userId))
        );
  
        if (presupuestoSnapshot.empty) {
          // No hay presupuesto definido, permitir eliminar el gasto
          await deleteDoc(doc(db, 'gastos', gasto.id));
          const updatedGastos = gastos.filter((g) => g.id !== gasto.id);
          setGastos(updatedGastos);
          toast.success('¡Gasto eliminado correctamente!');
        } else {
          const presupuestoDocRef = presupuestoSnapshot.docs[0].ref;
          const presupuestoData = presupuestoSnapshot.docs[0].data();
  
          if (presupuestoData.fecha < gasto.fecha) {
            const nuevoMontoPresupuesto = presupuestoData.presupuestoActual + gasto.monto;
  
            await Promise.all([
              deleteDoc(doc(db, 'gastos', gasto.id)),
              updateDoc(presupuestoDocRef, { presupuestoActual: nuevoMontoPresupuesto })
            ]);
  
            const updatedGastos = gastos.filter((g) => g.id !== gasto.id);
            setGastos(updatedGastos);
            toast.success('¡Gasto eliminado correctamente!');
            setPresupuesto({ ...presupuesto, monto: nuevoMontoPresupuesto });
          } else {
            await deleteDoc(doc(db, 'gastos', gasto.id));
            const updatedGastos = gastos.filter((g) => g.id !== gasto.id);
            setGastos(updatedGastos);
            toast.success('¡Gasto eliminado correctamente!');
          }
        }
      }
    } catch(error) {
      console.error('Error al eliminar el gasto:', error);
      toast.error('Ocurrió un error al eliminar el gasto.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!monedaPredeterminada) {
      toast.warning('No se puede agregar el gasto. Configura la moneda predeterminada en el panel de configuración que esta en el modulo de Usuario.');
      return;
    }
    
    const descripcion = e.target.descripcion.value;
    const monto = parseFloat(e.target.monto.value);
    const moneda = e.target.moneda.value;
    const categoria = e.target.categoria.value;
    const fecha = editingData ? new Date(editingData.fecha) : new Date();
  
    const user = auth.currentUser;
  
    const nuevoGasto = {
      userId: user.uid,
      fecha: fecha.toISOString(),
      descripcion,
      monto,
      moneda,
      categoria,
    };
  
    try {
      // Obtener el presupuesto actual del usuario
      const presupuestoQuerySnapshot = await getDocs(
        query(collection(db, 'presupuesto'), where('userId', '==', user.uid))
      );
      
      if (!presupuestoQuerySnapshot.empty) {
        const presupuestoDocRef = presupuestoQuerySnapshot.docs[0].ref;
        const presupuestoData = presupuestoQuerySnapshot.docs[0].data();
        const presupuestoActual = presupuestoData.presupuestoActual;
        const presupuestoFecha = new Date(presupuestoData.fecha);
        const gastoFecha = new Date(fecha);
  
        if (monto > presupuestoActual && !editingData) {
          // Enviar una notificación al usuario indicando que el monto del gasto es mayor al presupuesto actual
          toast.warning('El monto del gasto es mayor al presupuesto actual. No se puede agregar el gasto.');
          return; // Salir de la función sin guardar el gasto
        } else if (gastoFecha > presupuestoFecha) {
          // Calcular la diferencia de montos
          const diferenciaMonto = editingData ? monto - editingData.monto : monto;
          const nuevoMontoPresupuesto = presupuestoActual - diferenciaMonto;
          const saldoNegativo = nuevoMontoPresupuesto < 0;
  
          // Verificar si el monto del presupuesto resultaría en un saldo negativo
          if (saldoNegativo) {
            // Mostrar un mensaje de advertencia indicando que el monto del gasto editado resultaría en un saldo negativo
            toast.warning('El monto del gasto editado resultaría en un saldo negativo. No se puede guardar el cambio.');
            return; // Salir de la función sin guardar el cambio
          }
  
          // Restar la diferencia de montos al presupuesto actual
          const nuevoPresupuestoActual = presupuestoActual - diferenciaMonto;
  
          // Actualizar el campo presupuestoActual en el documento de presupuesto
          await updateDoc(presupuestoDocRef, { presupuestoActual: nuevoPresupuestoActual });
  
          // Verificar si el presupuesto actual es igual o menor que cero
          if (nuevoPresupuestoActual <= 0) {
            // Enviar una notificación al usuario indicando que el presupuesto ha llegado a cero
            // Puedes utilizar la biblioteca de notificaciones que prefieras (por ejemplo, react-toastify)
            toast.warning('¡Tu presupuesto ha llegado a cero! Actualiza tu presupuesto para seguir agregando gastos.');
          }
  
          // Actualizar el estado de presupuesto
          setPresupuesto({ ...presupuesto, monto: nuevoPresupuestoActual });
        } else {
          // No se realiza ningún cambio en el presupuesto
          toast.info('¡Este gasto es prehistórico para tu presupuesto actual!');
        }
      }
  
      // Guardar el gasto y mostrar el mensaje de éxito
      if (editingData) {
        await updateDoc(doc(db, 'gastos', editingData.id), nuevoGasto);
        const updatedGastos = gastos.map((gasto) =>
          gasto.id === editingData.id ? { id: gasto.id, ...nuevoGasto } : gasto
        );
        setGastos(updatedGastos);
        handleCloseModal();
        toast.success('¡Gasto actualizado correctamente!');
      } else {
        const docRef = await addDoc(collection(db, 'gastos'), nuevoGasto);
        setGastos([...gastos, { id: docRef.id, ...nuevoGasto }]);
        handleCloseModal();
        toast.success('¡Gasto agregado correctamente!');
      }
    } catch (error) {
      console.error('Error al guardar el gasto:', error);
      toast.error('Ocurrió un error al guardar el gasto.');
    }
  };
  
  const handleMontoChange = (e) => {
    const value = e.target.value;
    // Verificar si el valor es un número positivo
    if (value >= 0 || value === '') {
      setMonto(value);
    } else {
      // Si el valor es negativo, establecer el valor actual del campo "monto"
      e.target.value = monto;
    }
  };

  const handleCategoriaChange = (e) => {
    setFiltroCategoria(e.target.value);
  };

  return (
    <div className="cont">
      <div className="gastosflex-m">
        <div className="agregarFlex">
          <h2 className="title">Módulo de Gastos</h2>
          <button className="addButton" onClick={() => handleOpenModal(null)}>
              Agregar Gastos
          </button>
        </div>
        <div className='filtro-presu'> 
            <div className="filter-container">
                <FontAwesomeIcon
                    className={`filter-icon ${showFilter ? 'active' : ''}`}
                    icon={faFilter}
                    onClick={() => setShowFilter(!showFilter)}
                  />
                  <div className={`category-filter ${showFilter ? 'show' : ''}`}>
                    <select className="filter-select" value={filtroCategoria} onChange={handleCategoriaChange}>
                      <option value="">Todas las categorías</option>
                      <option value="Alimentos">Alimentos</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Alquiler">Alquiler</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Entretenimiento">Entretenimiento</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
              </div>
         
          
        {presupuesto && (
          <div className="card-presupuesto">
            <h3>Presupuesto Actual</h3>
            <p>
              Monto: {presupuesto.monto} {moneda}
            </p>
          </div>
        
        )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-cont">
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <div className="loadingtext">Cargando Gastos...</div>
        </div>
      ) : (
        <>
          {noHayGastos ? (
            <div className="no-gastos">
              <p>No hay gastos guardados aún.</p>
            </div>
          ) : (
            <div className="table-container">
          
              <div className="table-container" onClick={() => setShowFilter(false)}>
                <table {...getTableProps()} className="table">
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                        <th>Acciones</th>
                      </tr>
                    ))}
                  </thead>

                  <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          onClick={() => setSelectedRow(i)}
                          className={selectedRow === i ? 'selected' : ''}
                        >
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                          ))}
                          <td>
                            <div className="actions">
                              <FontAwesomeIcon
                                className="edit-icon"
                                icon={faEdit}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(i);
                                }}
                              />
                              <FontAwesomeIcon
                                className="delete-icon"
                                icon={faTrash}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(i);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button onClick={() => previousPage()} disabled={!canPreviousPage} className="pagination-button">
                  &lt;
                </button>
                <button onClick={() => nextPage()} disabled={!canNextPage} className="pagination-button">
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Agregar Gasto"
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className='modalTitle'>{editingData ? 'Editar Gasto' : 'Agregar Gasto'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Fecha:
            <input
              type="date"
              name="fecha"
              className="input"
              defaultValue={editingData ? initialDate : currentDate}
              required
              disabled
            />
          </label>

          <label>
            Descripción:
            <input type="text" name="descripcion" className="input" defaultValue={editingData ? editingData.descripcion : ''} required />
          </label>
          <label>
            Monto:
            <input
              type="number"
              name="monto"
              className="input"
              defaultValue={editingData ? editingData.monto : ''}
              onChange={handleMontoChange}
              required
            />
          </label>
          
          <label>
            Moneda:
            <input
              type="text"
              name="moneda"
              className="input"
              value={monedaPredeterminada}
              readOnly
              required
            />
          </label>
          <label>
            Categoría:
            <select name="categoria" className="input" defaultValue={editingData ? editingData.categoria : ''} required>
              <option value="Alimentos">Alimentos</option>
              <option value="Transporte">Transporte</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Servicios">Servicios</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Otros">Otros</option>
            </select>
          </label>
          <button className="saveButton" type="submit">
            {editingData ? 'Actualizar ' : 'Agregar '}
          </button>
          <button type="button" onClick={handleCloseModal} className="cancelButton">
            Cancelar
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Gastos;

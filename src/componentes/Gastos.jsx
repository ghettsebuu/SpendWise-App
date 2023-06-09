import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
  // const [currentDate, setCurrentDate] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(today); // Asignar el valor de today a currentDate
  const [initialDate, setInitialDate] = useState('');




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

      }
      setIsLoading(false);
    };
  
    /* const today = new Date().toISOString().split('T')[0];
    setCurrentDate(today); */
    
    fetchGastos();
  }, []);
  

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
      data: gastos,
      initialState: { pageIndex: pageIndex, pageSize: 4 }, // Establece el tamaño de página a 4
    },
    usePagination
  );

  const handleOpenModal = (index) => {
    if (index !== null) {
      const gasto = page[index].original;
      setEditingData(gasto);
      setInitialDate(gasto.fecha);
    } else {
      setEditingData(null);
      setInitialDate(currentDate);
    }
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setEditingData(null);
  };

  const handleDelete = async (index) => {
    const gasto = page[index].original;
  
    try {
      if (window.confirm('¿Estás seguro de eliminar los datos?')) {
        await deleteDoc(doc(db, 'gastos', gasto.id));
  
        const updatedGastos = gastos.filter((g) => g.id !== gasto.id);
  
        setGastos(updatedGastos); // Actualizar el estado después de la operación en la base de datos
  
        toast.success('¡Gasto eliminado correctamente!');
      }
    } catch (error) {
      console.error('Error al eliminar el gasto:', error);
      toast.error('Ocurrió un error al eliminar el gasto.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      hora: format(fecha, 'HH:mm:ss') // Formato HH:mm:ss
    };
  
    try {
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
  
      // Obtener el presupuesto actual del usuario
      const presupuestoQuerySnapshot = await getDocs(
        query(collection(db, 'presupuesto'), where('userId', '==', user.uid))
      );
  
      if (!presupuestoQuerySnapshot.empty) {
        const presupuestoDocRef = presupuestoQuerySnapshot.docs[0].ref;
        const presupuestoData = presupuestoQuerySnapshot.docs[0].data();
        const presupuestoActual = presupuestoData.presupuestoActual;
        const presupuestoFecha = new Date(presupuestoData.fecha );
        const gastoFecha = new Date(fecha );

       console.log('Fecha del presupuesto:', presupuestoFecha);
        console.log('Fecha del gasto:', gastoFecha);

  
        if (gastoFecha > presupuestoFecha) {
          // Calcular la diferencia de montos
          const diferenciaMonto = editingData ? monto - editingData.monto : monto;
  
          // Restar la diferencia de montos al presupuesto actual
          const nuevoPresupuestoActual = presupuestoActual - diferenciaMonto;
  
          // Actualizar el campo presupuestoActual en el documento de presupuesto
          await updateDoc(presupuestoDocRef, { presupuestoActual: nuevoPresupuestoActual });
  
          // Actualizar el estado de presupuesto
          setPresupuesto({ ...presupuesto, monto: nuevoPresupuestoActual });
        } else {
          // No se realiza ningún cambio en el presupuesto
          toast.info('¡Este gasto es prehistórico para tu presupuesto actual!');
        }
      }
    } catch (error) {
      console.error('Error al guardar el gasto:', error);
      toast.error('Ocurrió un error al guardar el gasto.');
    }
  };
 
  

  return (
    <div className="cont">
    <h2 className="title">Módulo de Gastos</h2>
    {presupuesto && (
      <div className="card-presupuesto">
        <h3>Presupuesto Actual</h3>
        <p>
          Monto: {presupuesto.monto} {presupuesto.moneda}
        </p>
      </div>
    )}

    <button className="addButton" onClick={() => handleOpenModal(null)}>
      Agregar Gastos
    </button>

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
          <div className='no-gastos'><p>No hay gastos guardados aún.</p></div>
          
        ) : (
          <>
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
                      <div className="actions" >
                        <FontAwesomeIcon className="edit-icon"
                          icon={faEdit}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(i);
                          }}
                        />
                        <FontAwesomeIcon className="delete-icon"
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

          <div className="pagination">
                <button onClick={() => previousPage()} disabled={!canPreviousPage} className="pagination-button">
                  &lt;
                </button>
                <button onClick={() => nextPage()} disabled={!canNextPage} className="pagination-button">
                  &gt;
                </button>
          </div>

          </>
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
            <input type="text" name="descripcion" className="input" defaultValue={editingData ? editingData.descripcion : ''}
              required />
          </label>
          <label>
            Monto:
            <input type="number" name="monto" className="input" defaultValue={editingData ? editingData.monto : ''}
              required />
          </label>
          <label>
            Moneda:
            <select name="moneda" className="input"  defaultValue={editingData ? editingData.moneda : ''}
              required>
              <option>USD</option>
              <option>BS</option>
              <option>EUR</option>
            </select>
          </label>
          <label>
            Categoría:
            <select name="categoria" className="input"  defaultValue={editingData ? editingData.categoria : ''}
              required>
              <option>Alimentos</option>
              <option>Transporte</option>
              <option>Alquiler</option>
              <option>Servicios</option>
              <option>Entretenimiento</option>
              <option>Otros</option>
              {/* Agrega más opciones de categorías según tus necesidades */}
            </select>
          </label>
          <button className="saveButton" type="submit">
            {editingData ? 'Actualizar ' : 'Agregar '}
          </button>
          <button  type="button" onClick={handleCloseModal} className="cancelButton">
            Cancelar
          </button>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Gastos;
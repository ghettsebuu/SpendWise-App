
import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

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
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    
    const fetchGastos = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'gastos'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const gastosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGastos(gastosData);
        setIsLoading(false);
      }
    };

    fetchGastos();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Fecha',
        accessor: 'fecha',
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
    } else {
      setEditingData(null);
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
    const monto = e.target.monto.value;
    const moneda = e.target.moneda.value;
    const categoria = e.target.categoria.value;
    const fecha = e.target.fecha.value;
  
    const user = auth.currentUser;
  
    const nuevoGasto = {
      userId: user.uid, // Asociar el ID del usuario al gasto
      fecha,
      descripcion,
      monto,
      moneda,
      categoria,
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
    } catch (error) {
      console.error('Error al guardar el gasto:', error);
      toast.error('Ocurrió un error al guardar el gasto.');
    }
  };

  return (
    <div className="cont">
      <h2 className="title">Módulo de Gastos</h2>

      <button className="addButton"  onClick={() => handleOpenModal(null)}>Agregar Gastos</button>
      {isLoading ? (
        <div className="loading-cont">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <div className="loadingtext">Cargando Gastos...</div>
      </div>

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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Agregar Gasto"
        className="modal"
        overlayClassName="overlay"

      >
        <h2>{editingData ? 'Editar Gasto' : 'Agregar Gasto'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Fecha:
            <input type="date" name="fecha" className="input"  defaultValue={editingData ? editingData.fecha : ''}
              required />
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

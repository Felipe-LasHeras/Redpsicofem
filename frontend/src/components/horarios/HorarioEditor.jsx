import React, { useState, useEffect } from 'react';
import { terapeutasApi } from '../../services/terapeutasApi';

const HorarioEditor = ({ terapeuta, onClose, onSave }) => {
  const [tipoAtencionActual, setTipoAtencionActual] = useState('online');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Días de la semana y opciones de horarios como constantes
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const opcionesHorarios = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00'
  ];
  
  // Estructura de horarios: { online: {}, presencial: {} }
  // Cada tipo tiene formato: { lunes: ['08:00-09:00', '09:00-10:00', ...], martes: [...], ... }
  const [horarios, setHorarios] = useState({
    online: {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: []
    },
    presencial: {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: []
    }
  });

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!terapeuta) return;
    
    const horariosIniciales = {
      online: {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: []
      },
      presencial: {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: []
      }
    };

    // Si existe horarios_online en el terapeuta, procesarlo
    if (terapeuta.horarios_online) {
      try {
        let horariosOnline;
        
        // Asegurarse de que tenemos un objeto, no un string
        if (typeof terapeuta.horarios_online === 'string') {
          horariosOnline = JSON.parse(terapeuta.horarios_online);
        } else {
          horariosOnline = terapeuta.horarios_online;
        }
        
        // Asegurar que la estructura es correcta
        diasSemana.forEach(dia => {
          if (horariosOnline[dia] && Array.isArray(horariosOnline[dia])) {
            horariosIniciales.online[dia] = [...horariosOnline[dia]];
          }
        });
      } catch (error) {
        console.error("Error al procesar horarios online:", error);
      }
    }

    // Si existe horarios_presencial en el terapeuta, procesarlo
    if (terapeuta.horarios_presencial) {
      try {
        let horariosPresencial;
        
        // Asegurarse de que tenemos un objeto, no un string
        if (typeof terapeuta.horarios_presencial === 'string') {
          horariosPresencial = JSON.parse(terapeuta.horarios_presencial);
        } else {
          horariosPresencial = terapeuta.horarios_presencial;
        }
        
        // Asegurar que la estructura es correcta
        diasSemana.forEach(dia => {
          if (horariosPresencial[dia] && Array.isArray(horariosPresencial[dia])) {
            horariosIniciales.presencial[dia] = [...horariosPresencial[dia]];
          }
        });
      } catch (error) {
        console.error("Error al procesar horarios presenciales:", error);
      }
    }

    setHorarios(horariosIniciales);
    
    // Establecer el tipo de atención inicial basado en los datos del terapeuta
    if (terapeuta.atiende_online) {
      setTipoAtencionActual('online');
    } else if (terapeuta.atiende_presencial) {
      setTipoAtencionActual('presencial');
    }
  }, [terapeuta]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Manejar la selección/deselección de un horario
  const toggleHorario = (dia, hora, tipo) => {
    setHorarios(prevHorarios => {
      // Deep copy para evitar mutaciones indeseadas
      const nuevosHorarios = JSON.parse(JSON.stringify(prevHorarios)); 
      
      // Asegurarse de que el array existe
      if (!Array.isArray(nuevosHorarios[tipo][dia])) {
        nuevosHorarios[tipo][dia] = [];
      }
      
      const horariosDelDia = nuevosHorarios[tipo][dia];
      
      if (horariosDelDia.includes(hora)) {
        // Si ya está seleccionado, quitarlo
        nuevosHorarios[tipo][dia] = horariosDelDia.filter(h => h !== hora);
      } else {
        // Si no está seleccionado, agregarlo y ordenarlo
        nuevosHorarios[tipo][dia] = [...horariosDelDia, hora].sort((a, b) => {
          const horaA = parseInt(a.split('-')[0]);
          const horaB = parseInt(b.split('-')[0]);
          return horaA - horaB;
        });
      }
      
      return nuevosHorarios;
    });
  };

  // Guardar cambios
  const guardarCambios = async () => {
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      if (!terapeuta || !terapeuta.id) {
        throw new Error("No se pudo identificar el terapeuta para guardar los horarios");
      }
      
      // Preparar datos para guardar
      const datosActualizados = {
        horarios_online: JSON.stringify(horarios.online),
        horarios_presencial: JSON.stringify(horarios.presencial),
      };
      
      // Actualizar en la base de datos
      await terapeutasApi.updateHorarios(terapeuta.id, datosActualizados);
      
      setMensaje({ 
        tipo: 'success', 
        texto: 'Horarios actualizados correctamente' 
      });
      
      // Notificar al componente padre
      if (onSave) {
        onSave(horarios);
      }
      
      // Cerrar modal después de un breve retraso
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error("Error al guardar horarios:", error);
      setMensaje({ 
        tipo: 'error', 
        texto: `Error al guardar: ${error.message || 'Hubo un problema al actualizar los horarios'}` 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Comprobar si un horario está seleccionado
  const estaSeleccionado = (dia, hora, tipo) => {
    // Verificar que existe el día y el array antes de buscar
    return Array.isArray(horarios[tipo][dia]) && 
           horarios[tipo][dia].includes(hora);
  };

  // Verificar si el terapeuta es válido
  if (!terapeuta) {
    return (
      <div className="alert alert-danger">
        Error: No se pudo cargar la información del terapeuta
      </div>
    );
  }

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Editar Horarios Disponibles</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {mensaje.texto && (
              <div className={`alert alert-${mensaje.tipo === 'success' ? 'success' : 'danger'} mb-3`}>
                {mensaje.texto}
              </div>
            )}
            
            <div className="mb-4">
              <label className="form-label">Tipo de atención a editar:</label>
              <div className="btn-group w-100">
                <button 
                  className={`btn ${tipoAtencionActual === 'online' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTipoAtencionActual('online')}
                  disabled={!terapeuta.atiende_online}
                >
                  Online
                </button>
                <button 
                  className={`btn ${tipoAtencionActual === 'presencial' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTipoAtencionActual('presencial')}
                  disabled={!terapeuta.atiende_presencial}
                >
                  Presencial
                </button>
              </div>
            </div>
            
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Selecciona las casillas correspondientes a los horarios en que estás disponible para atender pacientes.
              {terapeuta.atiende_online && terapeuta.atiende_presencial && (
                <span> Puedes cambiar entre la configuración de horarios online y presencial usando los botones de arriba.</span>
              )}
            </div>

            {/* Tabla de horarios para el tipo seleccionado */}
            <div className="table-responsive mt-3">
              <h5 className="mb-3">
                Horarios {tipoAtencionActual === 'online' ? 'Online' : 'Presenciales'}
              </h5>
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: '110px' }}>Hora</th>
                    {diasSemana.map(dia => (
                      <th key={dia} className="text-center text-capitalize">{dia}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {opcionesHorarios.map(hora => (
                    <tr key={hora}>
                      <td className="text-center align-middle">{hora}</td>
                      {diasSemana.map(dia => (
                        <td key={`${dia}-${hora}`} className="text-center p-2">
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={estaSeleccionado(dia, hora, tipoAtencionActual)}
                              onChange={() => toggleHorario(dia, hora, tipoAtencionActual)}
                              id={`${tipoAtencionActual}-${dia}-${hora}`}
                            />
                            <label 
                              className="form-check-label" 
                              htmlFor={`${tipoAtencionActual}-${dia}-${hora}`}
                              style={{ cursor: 'pointer' }}
                            >
                            </label>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={guardarCambios}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorarioEditor;
import React, { useState, useEffect } from 'react';
import { terapeutasApi } from '../../services/terapeutasApi';

const HorarioEditor = ({ terapeuta, onClose, onSave }) => {
  const [tipoAtencion, setTipoAtencion] = useState('ambos');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
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

  // Opciones de horarios para seleccionar
  const opcionesHorarios = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00'
  ];

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  // Inicializar horarios a partir de los datos del terapeuta
  useEffect(() => {
    if (terapeuta) {
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
          const horariosOnline = typeof terapeuta.horarios_online === 'string' 
            ? JSON.parse(terapeuta.horarios_online) 
            : terapeuta.horarios_online;
            
          Object.assign(horariosIniciales.online, horariosOnline);
        } catch (error) {
          console.error("Error al procesar horarios online:", error);
        }
      }

      // Si existe horarios_presencial en el terapeuta, procesarlo
      if (terapeuta.horarios_presencial) {
        try {
          const horariosPresencial = typeof terapeuta.horarios_presencial === 'string' 
            ? JSON.parse(terapeuta.horarios_presencial) 
            : terapeuta.horarios_presencial;
            
          Object.assign(horariosIniciales.presencial, horariosPresencial);
        } catch (error) {
          console.error("Error al procesar horarios presenciales:", error);
        }
      }

      setHorarios(horariosIniciales);
      
      // Establecer el tipo de atención inicial basado en los datos del terapeuta
      if (terapeuta.atiende_online && terapeuta.atiende_presencial) {
        setTipoAtencion('ambos');
      } else if (terapeuta.atiende_online) {
        setTipoAtencion('online');
      } else if (terapeuta.atiende_presencial) {
        setTipoAtencion('presencial');
      }
    }
  }, [terapeuta]);

  // Manejar la selección/deselección de un horario
  const toggleHorario = (dia, hora, tipo) => {
    setHorarios(prevHorarios => {
      const nuevosHorarios = { ...prevHorarios };
      const horariosDelDia = [...nuevosHorarios[tipo][dia]];
      
      if (horariosDelDia.includes(hora)) {
        // Si ya está seleccionado, quitarlo
        const index = horariosDelDia.indexOf(hora);
        horariosDelDia.splice(index, 1);
      } else {
        // Si no está seleccionado, agregarlo y ordenarlo
        horariosDelDia.push(hora);
        horariosDelDia.sort((a, b) => {
          const horaA = parseInt(a.split('-')[0]);
          const horaB = parseInt(b.split('-')[0]);
          return horaA - horaB;
        });
      }
      
      nuevosHorarios[tipo][dia] = horariosDelDia;
      return nuevosHorarios;
    });
  };

  // Guardar cambios
  const guardarCambios = async () => {
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });
    
    try {
      // Preparar datos para guardar
      const datosActualizados = {
        id: terapeuta.id,
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

  // Renderizado de las celdas del horario según el tipo seleccionado
  const renderizarHorarios = () => {
    const tiposAMostrar = tipoAtencion === 'ambos' 
      ? ['online', 'presencial'] 
      : [tipoAtencion];
    
    return (
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="text-center">Hora</th>
              {diasSemana.map(dia => (
                <th key={dia} className="text-center text-capitalize">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opcionesHorarios.map(hora => (
              <tr key={hora}>
                <td className="text-center">{hora}</td>
                {diasSemana.map(dia => (
                  <td key={`${dia}-${hora}`} className="text-center p-0">
                    <div className="d-flex flex-column">
                      {tiposAMostrar.map(tipo => (
                        <div 
                          key={`${tipo}-${dia}-${hora}`}
                          className={`p-2 ${tiposAMostrar.length > 1 ? 'border-bottom' : ''}`}
                        >
                          <div className="form-check d-flex justify-content-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`${tipo}-${dia}-${hora}`}
                              checked={horarios[tipo][dia].includes(hora)}
                              onChange={() => toggleHorario(dia, hora, tipo)}
                            />
                            {tiposAMostrar.length > 1 && (
                              <label className="form-check-label ms-1" htmlFor={`${tipo}-${dia}-${hora}`}>
                                {tipo === 'online' ? 'Online' : 'Presencial'}
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
                  className={`btn ${tipoAtencion === 'online' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTipoAtencion('online')}
                  disabled={!terapeuta.atiende_online}
                >
                  Online
                </button>
                <button 
                  className={`btn ${tipoAtencion === 'presencial' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTipoAtencion('presencial')}
                  disabled={!terapeuta.atiende_presencial}
                >
                  Presencial
                </button>
                <button 
                  className={`btn ${tipoAtencion === 'ambos' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setTipoAtencion('ambos')}
                  disabled={!terapeuta.atiende_online || !terapeuta.atiende_presencial}
                >
                  Ambos
                </button>
              </div>
            </div>
            
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Selecciona las casillas correspondientes a los horarios en que estás disponible para atender pacientes.
              {tipoAtencion === 'ambos' && (
                <span> Para cada horario, puedes elegir si estás disponible online, presencial o ambos.</span>
              )}
            </div>
            
            {renderizarHorarios()}
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
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { terapeutasApi } from "../../services/terapeutasApi";
import HorarioEditor from "../horarios/HorarioEditor";

const PerfilTerapeuta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [terapeuta, setTerapeuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarEditorHorarios, setMostrarEditorHorarios] = useState(false);
  
  // Estructura de datos para horarios
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

  // Días de la semana para iteración
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const cargarTerapeuta = async () => {
      try {
        setLoading(true);
        
        // Validar ID
        if (!id) {
          throw new Error("ID de terapeuta no válido");
        }
        
        const data = await terapeutasApi.getById(id);
        
        if (!data) {
          throw new Error("No se encontraron datos del terapeuta");
        }
        
        setTerapeuta(data);
        
        // Cargar horarios online
        if (data.horarios_online) {
          try {
            let horariosOnlineParsed;
            
            if (typeof data.horarios_online === 'string') {
              horariosOnlineParsed = JSON.parse(data.horarios_online);
            } else {
              horariosOnlineParsed = data.horarios_online;
            }
            
            // Asegurar estructura correcta de días
            const horariosOnline = { ...horarios.online };
            
            diasSemana.forEach(dia => {
              if (horariosOnlineParsed[dia] && Array.isArray(horariosOnlineParsed[dia])) {
                horariosOnline[dia] = [...horariosOnlineParsed[dia]];
              }
            });
            
            setHorarios(prev => ({
              ...prev,
              online: horariosOnline
            }));
          } catch (e) {
            console.error("Error al procesar horarios online:", e);
          }
        }
        
        // Cargar horarios presenciales
        if (data.horarios_presencial) {
          try {
            let horariosPresencialParsed;
            
            if (typeof data.horarios_presencial === 'string') {
              horariosPresencialParsed = JSON.parse(data.horarios_presencial);
            } else {
              horariosPresencialParsed = data.horarios_presencial;
            }
            
            // Asegurar estructura correcta de días
            const horariosPresencial = { ...horarios.presencial };
            
            diasSemana.forEach(dia => {
              if (horariosPresencialParsed[dia] && Array.isArray(horariosPresencialParsed[dia])) {
                horariosPresencial[dia] = [...horariosPresencialParsed[dia]];
              }
            });
            
            setHorarios(prev => ({
              ...prev,
              presencial: horariosPresencial
            }));
          } catch (e) {
            console.error("Error al procesar horarios presenciales:", e);
          }
        }
      } catch (err) {
        console.error("Error al cargar terapeuta:", err);
        setError(`Error al cargar los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    cargarTerapeuta();
  }, [id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Actualizar estado después de guardar horarios
  const handleGuardarHorarios = (nuevosHorarios) => {
    setHorarios(nuevosHorarios);
    
    // Actualizar los datos del terapeuta con los nuevos horarios
    setTerapeuta(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        horarios_online: JSON.stringify(nuevosHorarios.online),
        horarios_presencial: JSON.stringify(nuevosHorarios.presencial)
      };
    });
  };

  // Función que verifica si hay horarios válidos para mostrar
  const hayHorariosConfigurados = (tipo) => {
    if (!horarios[tipo]) return false;
    
    return Object.values(horarios[tipo]).some(
      diasHorario => Array.isArray(diasHorario) && diasHorario.length > 0
    );
  };

  // Renderizar la tabla de horarios resumida
  const renderHorarioResumen = (tipo) => {
    if (!hayHorariosConfigurados(tipo)) {
      return <p className="text-muted">No hay horarios configurados</p>;
    }

    return (
      <div className="table-responsive">
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Día</th>
              <th>Horarios</th>
            </tr>
          </thead>
          <tbody>
            {diasSemana.map(dia => {
              // Verificar que existen horarios para este día
              const horariosDelDia = horarios[tipo][dia];
              
              if (!Array.isArray(horariosDelDia) || horariosDelDia.length === 0) {
                return null;
              }
              
              return (
                <tr key={dia}>
                  <td className="text-capitalize">{dia}</td>
                  <td>
                    {horariosDelDia.map((hora) => (
                      <span key={hora} className="badge bg-primary me-1 mb-1">{hora}</span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando información del terapeuta...</p>
      </div>
    );
  }

  // Mostrar error si ocurre
  if (error || !terapeuta) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          {error || "No se pudo cargar la información del terapeuta"}
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/admin/dashboard')}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Perfil de Terapeuta</h3>
                <button 
                  className="btn btn-light btn-sm"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4>{terapeuta.nombre} {terapeuta.apellido}</h4>
                  <p className="text-muted mb-3">
                    <span className="badge bg-info me-2">{terapeuta.tipo_terapeuta_nombre || (terapeuta.tipo_terapeuta ? "Redpsicofem" : "Red derivación")}</span>
                    <span>{terapeuta.especialidad}</span>
                  </p>
                  <p><strong>RUT:</strong> {terapeuta.rut || "No disponible"}</p>
                  <p><strong>Región:</strong> {terapeuta.region || "No disponible"}</p>
                  <p><strong>Comuna:</strong> {terapeuta.comuna || "No disponible"}</p>
                  <p><strong>Valor consulta:</strong> ${terapeuta.valor_consulta || "No especificado"}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Descripción:</strong> {terapeuta.descripcion || "Sin descripción"}</p>
                  <p><strong>Edad de atención:</strong> {terapeuta.edad_atencion || "No especificado"}</p>
                  <p><strong>Tipo de atención:</strong> {terapeuta.tipo_atencion || "No especificado"}</p>
                  
                  <div className="d-flex gap-2 mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setMostrarEditorHorarios(true)}
                    >
                      <i className="bi bi-clock me-1"></i> Editar Horarios Disponibles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Horarios Disponibles</h4>
            </div>
            <div className="card-body">
              <div className="row">
                {terapeuta.atiende_online && (
                  <div className="col-md-6">
                    <h5 className="border-bottom pb-2 mb-3">Horarios Online</h5>
                    {renderHorarioResumen('online')}
                  </div>
                )}
                
                {terapeuta.atiende_presencial && (
                  <div className="col-md-6">
                    <h5 className="border-bottom pb-2 mb-3">Horarios Presenciales</h5>
                    {renderHorarioResumen('presencial')}
                  </div>
                )}

                {!terapeuta.atiende_online && !terapeuta.atiende_presencial && (
                  <div className="col-12">
                    <div className="alert alert-warning">
                      Este terapeuta no tiene configurados los tipos de atención.
                      Por favor actualice el perfil para indicar si atiende online, presencial o ambos.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición de horarios */}
      {mostrarEditorHorarios && terapeuta && (
        <HorarioEditor 
          terapeuta={terapeuta}
          onClose={() => setMostrarEditorHorarios(false)}
          onSave={handleGuardarHorarios}
        />
      )}
    </div>
  );
};

export default PerfilTerapeuta;
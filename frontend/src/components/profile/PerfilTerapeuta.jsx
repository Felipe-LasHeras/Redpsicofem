import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { terapeutasApi } from "../../services/terapeutasApi";
import HorarioEditor from "../horarios/HorarioEditor";

const PerfilTerapeuta = () => {
  const { id } = useParams();
  const [terapeuta, setTerapeuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarEditorHorarios, setMostrarEditorHorarios] = useState(false);
  const [horarios, setHorarios] = useState({
    online: {},
    presencial: {}
  });

  useEffect(() => {
    const cargarTerapeuta = async () => {
      try {
        setLoading(true);
        const data = await terapeutasApi.getById(id || 1); // Si no hay ID, carga el primer terapeuta
        setTerapeuta(data);
        
        // Cargar horarios si existen
        if (data.horarios_online) {
          try {
            const horariosOnline = typeof data.horarios_online === 'string' 
              ? JSON.parse(data.horarios_online) 
              : data.horarios_online;
              
            setHorarios(prev => ({
              ...prev,
              online: horariosOnline
            }));
          } catch (e) {
            console.error("Error al procesar horarios online:", e);
          }
        }
        
        if (data.horarios_presencial) {
          try {
            const horariosPresencial = typeof data.horarios_presencial === 'string' 
              ? JSON.parse(data.horarios_presencial) 
              : data.horarios_presencial;
              
            setHorarios(prev => ({
              ...prev,
              presencial: horariosPresencial
            }));
          } catch (e) {
            console.error("Error al procesar horarios presenciales:", e);
          }
        }
      } catch (err) {
        setError("Error al cargar los datos del terapeuta");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarTerapeuta();
  }, [id]);

  const handleGuardarHorarios = (nuevosHorarios) => {
    setHorarios(nuevosHorarios);
    // Actualizar los datos del terapeuta con los nuevos horarios
    setTerapeuta(prev => ({
      ...prev,
      horarios_online: JSON.stringify(nuevosHorarios.online),
      horarios_presencial: JSON.stringify(nuevosHorarios.presencial)
    }));
  };

  const renderHorarioResumen = (tipo) => {
    if (!horarios[tipo] || Object.keys(horarios[tipo]).length === 0) {
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
            {Object.entries(horarios[tipo]).map(([dia, horas]) => {
              if (!horas || horas.length === 0) return null;
              
              return (
                <tr key={dia}>
                  <td className="text-capitalize">{dia}</td>
                  <td>
                    {horas.map((hora, index) => (
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

  if (error || !terapeuta) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          {error || "No se pudo cargar la información del terapeuta"}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Perfil de Terapeuta</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4>{terapeuta.nombre} {terapeuta.apellido}</h4>
                  <p className="text-muted mb-3">
                    <span className="badge bg-info me-2">{terapeuta.tipo_terapeuta_nombre || (terapeuta.tipo_terapeuta ? "Redpsicofem" : "Red derivación")}</span>
                    <span>{terapeuta.especialidad}</span>
                  </p>
                  <p><strong>RUT:</strong> {terapeuta.rut}</p>
                  <p><strong>Región:</strong> {terapeuta.region}</p>
                  <p><strong>Comuna:</strong> {terapeuta.comuna}</p>
                  <p><strong>Valor consulta:</strong> ${terapeuta.valor_consulta}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Descripción:</strong> {terapeuta.descripcion}</p>
                  <p><strong>Edad de atención:</strong> {terapeuta.edad_atencion}</p>
                  <p><strong>Tipo de atención:</strong> {terapeuta.tipo_atencion}</p>
                  
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
      {mostrarEditorHorarios && (
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
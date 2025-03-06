import React, { useEffect, useState } from "react";
import { pacientesApi } from "../../services/pacientesApi";
import { terapeutasApi } from "../../services/terapeutasApi";
import { Link } from "react-router-dom";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("pacientes");
  const [pacientes, setPacientes] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [tipoTerapeuta, setTipoTerapeuta] = useState("todos"); // Estado para el filtro
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "pacientes") {
          const pacientesData = await pacientesApi.getAll();
          setPacientes(pacientesData);
        } else {
          // Obtener terapeutas según el filtro seleccionado
          let terapeutasData;
          if (tipoTerapeuta === "todos") {
            terapeutasData = await terapeutasApi.getAll();
          } else {
            terapeutasData = await terapeutasApi.getByTipo(tipoTerapeuta);
          }
          setTerapeutas(terapeutasData);
        }
      } catch (error) {
        console.error(`Error al obtener ${activeTab}:`, error);
      }
    };

    fetchData();
  }, [activeTab, tipoTerapeuta]); // Añadir tipoTerapeuta como dependencia

  const previewFieldsPacientes = [
    "email",
    "nombre",
    "apellido",
    "telefono",
    "region",
    "comuna",
    "horarios",
    "modalidad",
  ];

  const previewFieldsTerapeutas = [
    "nombre",
    "apellido",
    "tipo_terapeuta_nombre", // Añadido para mostrar el tipo
    "especialidad",
    "comuna",
    "lugar_atencion",
    "valor_consulta",
    "edad_atencion",
    "tipo_atencion",
  ];

  const fieldNameMap = {
    // Campos comunes
    email: "Correo",
    nombre: "Nombre",
    apellido: "Apellido",
    rut: "RUT",
    region: "Región",
    comuna: "Comuna",
    horarios: "Horarios",
    
    // Campos específicos de pacientes
    edad: "Edad",
    ciudad: "Ciudad",
    direccion: "Dirección",
    telefono: "Teléfono",
    nombre_contacto_emergencia: "Contacto de emergencia",
    telefono_contacto_emergencia: "Teléfono de emergencia",
    motivo_consulta: "Motivo de consulta",
    diagnostico: "Diagnóstico",
    sintomas: "Síntomas",
    arancel: "Arancel",
    prevision: "Previsión",
    modalidad: "Modalidad",
    psicologo_varon: "Psicólogo varón",
    practicante: "Practicante",
    pregunta: "Pregunta adicional",
    campos_dinamicos: "Campos adicionales",
    
    // Campos específicos de terapeutas
    tipo_terapeuta: "Tipo de Terapeuta (Legacy)",
    tipo_terapeuta_nombre: "Tipo de Terapeuta",
    especialidad: "Especialidad",
    lugar_atencion: "Lugar de Atención",
    valor_consulta: "Valor Consulta",
    descripcion: "Descripción",
    edad_atencion: "Edad de Atención",
    tipo_atencion: "Tipo de Atención",
    direccion_atencion: "Dirección de Atención",
    atiende_ninos: "Atiende Niños",
    atiende_adolescentes: "Atiende Adolescentes",
    atiende_adultos: "Atiende Adultos",
    atiende_hombre_cis: "Atiende Hombre Cis",
    atiende_presencial: "Atiende Presencial",
    atiende_online: "Atiende Online",
    arancel_diferencial: "Arancel Diferencial",
    valor_general_atencion: "Valor General",
    cupos_30000_35000: "Cupos $30.000-$35.000",
    cupos_25000_29000: "Cupos $25.000-$29.000",
    cupos_20000_24000: "Cupos $20.000-$24.000",
    cupos_15000_19000: "Cupos $15.000-$19.000",
    horarios_online: "Horarios Online",
    horarios_presencial: "Horarios Presenciales"
  };
  
  // Función para formatear valores que pueden ser objetos JSON
  const formatValue = (key, value) => {
    if (value === null || value === undefined) {
      return "No especificado";
    }
    
    // Si es un objeto y es horarios_online o horarios_presencial
    if (typeof value === 'object' && (key === 'horarios_online' || key === 'horarios_presencial')) {
      try {
        // Intentamos formatear el objeto de horarios de manera legible
        const diasSemana = Object.keys(value);
        if (diasSemana.length === 0) return "Sin horarios configurados";
        
        return diasSemana
          .filter(dia => Array.isArray(value[dia]) && value[dia].length > 0)
          .map(dia => `${dia}: ${value[dia].join(', ')}`)
          .join('; ');
      } catch (error) {
        console.error(`Error formateando ${key}:`, error);
        return "Error en formato";
      }
    }
    
    // Si es un boolean lo convertimos a texto
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }
    
    // Para otros casos simplemente convertimos a string
    return String(value);
  };
  
  // Añadir selector de tipo de terapeuta en la parte superior
  const renderTerapeutasFilter = () => {
    if (activeTab !== "terapeutas") return null;

    return (
      <div className="mb-4">
        <div className="btn-group">
          <button
            className={`btn ${tipoTerapeuta === "todos" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTipoTerapeuta("todos")}
          >
            Todos
          </button>
          <button
            className={`btn ${tipoTerapeuta === "Redpsicofem" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTipoTerapeuta("Redpsicofem")}
          >
            Redpsicofem
          </button>
          <button
            className={`btn ${tipoTerapeuta === "Red derivacion" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setTipoTerapeuta("Red derivacion")}
          >
            Red de Derivación
          </button>
        </div>
      </div>
    );
  };

  const renderCards = (dataList, previewFields) => {
    if (dataList.length === 0) {
      return <div className="container mt-4">No hay datos para mostrar</div>;
    }

    return (
      <div className="row g-4">
        {dataList.map((data, index) => {
          const isExpanded = expandedCard === index;

          return (
            <div
              key={index}
              className={`${
                isExpanded ? "col-12" : "col-12 col-md-6 col-lg-4"
              }`}
              style={{
                transition: "all 0.3s ease-in-out",
                order: isExpanded ? "-1" : "initial",
              }}
            >
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    {data.nombre} {data.apellido}
                  </h5>
                  {data.tipo_terapeuta_nombre && (
                    <span className="badge bg-info">
                      {data.tipo_terapeuta_nombre}
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <div
                    className={`row g-3 ${
                      isExpanded
                        ? "row-cols-1 row-cols-sm-2 row-cols-md-3"
                        : "row-cols-1"
                    }`}
                  >
                    {Object.entries(data).map(([key, value]) => {
                      if (key === "id" || key === "created_at" || key === "ultima_actualizacion") return null;
                      if (!isExpanded && !previewFields.includes(key))
                        return null;
                        
                      // Manejo especial para los campos dinámicos
                      if (key === "campos_dinamicos" && value && Object.keys(value).length > 0) {
                        return (
                          <div key={key} className="col">
                            <div className="p-3 bg-light rounded h-100">
                              <h6 className="text-muted mb-2 text-break">
                                {fieldNameMap[key] || key}
                              </h6>
                              <div className="small">
                                {Object.entries(value).map(([campoNombre, campoValor]) => (
                                  <div key={campoNombre} className="mb-2">
                                    <strong>{campoNombre}:</strong> {" "}
                                    {Array.isArray(campoValor) 
                                      ? campoValor.join(", ") 
                                      : String(campoValor)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="col">
                          <div className="p-3 bg-light rounded h-100">
                            <h6 className="text-muted mb-1 text-break">
                              {fieldNameMap[key] || key}
                            </h6>
                            <p className="mb-0 text-break small">
                              {formatValue(key, value)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() =>
                        setExpandedCard(expandedCard === index ? null : index)
                      }
                      className="btn btn-primary flex-grow-1"
                    >
                      {isExpanded ? "Ver menos" : "Ver más"}
                    </button>
                    
                    {activeTab === "terapeutas" && (
                      <Link 
                        to={`/terapeuta/${data.id}`} 
                        className="btn btn-outline-primary"
                        title="Ver perfil completo"
                      >
                        <i className="bi bi-person-badge"></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4">Dashboard</h1>
        <div className="d-flex gap-2">
          <Link to="/registro-terapeuta" className="btn btn-success">
            <i className="bi bi-plus-circle me-1"></i> Nuevo Terapeuta
          </Link>
          <div className="btn-group">
            <button
              className={`btn btn-lg ${
                activeTab === "pacientes" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("pacientes")}
            >
              Pacientes
            </button>
            <button
              className={`btn btn-lg ${
                activeTab === "terapeutas" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setActiveTab("terapeutas")}
            >
              Terapeutas
            </button>
          </div>
          
          <Link to="/admin/campos" className="btn btn-lg btn-outline-success">
            Gestionar Campos
          </Link>
        </div>
      </div>

      {/* Filtro de tipo de terapeuta */}
      {renderTerapeutasFilter()}

      {/* Renderizado de datos */}
      {activeTab === "pacientes"
        ? renderCards(pacientes, previewFieldsPacientes)
        : renderCards(terapeutas, previewFieldsTerapeutas)}
    </div>
  );
}

export default Dashboard;
import React, { useEffect, useState } from "react";
import { pacientesApi } from "../../services/pacientesApi";
import { terapeutasApi } from "../../services/terapeutasApi";
import { Link } from "react-router-dom";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("pacientes");
  const [pacientes, setPacientes] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "pacientes") {
          const pacientesData = await pacientesApi.getAll();
          setPacientes(pacientesData);
        } else {
          const terapeutasData = await terapeutasApi.getAll();
          setTerapeutas(terapeutasData);
        }
      } catch (error) {
        console.error(`Error al obtener ${activeTab}:`, error);
      }
    };

    fetchData();
  }, [activeTab]);

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
    "tipo_terapeuta",
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
    tipo_terapeuta: "Tipo de Terapeuta",
    especialidad: "Especialidad",
    lugar_atencion: "Lugar de Atención",
    valor_consulta: "Valor Consulta",
    descripcion: "Descripción",
    edad_atencion: "Edad de Atención",
    tipo_atencion: "Tipo de Atención",
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
                              {typeof value === "boolean"
                                ? value
                                  ? "Sí"
                                  : "No"
                                : value || "No especificado"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-footer bg-white border-top-0">
                  <button
                    onClick={() =>
                      setExpandedCard(expandedCard === index ? null : index)
                    }
                    className="btn btn-primary w-100"
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
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
          
          {/* Enlace a gestión de campos */}
          <Link to="/admin/campos" className="btn btn-lg btn-outline-success">
            Gestionar Campos
          </Link>
        </div>
      </div>

      {activeTab === "pacientes"
        ? renderCards(pacientes, previewFieldsPacientes)
        : renderCards(terapeutas, previewFieldsTerapeutas)}
    </div>
  );
}

export default Dashboard;
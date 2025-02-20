import React, { useEffect, useState } from "react";
import { pacientesApi } from "../../services/pacientesApi";
import { terapeutasApi } from "../../services/terapeutasApi";

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
    // Campos de pacientes
    email: "Correo",
    nombre: "Nombre",
    apellido: "Apellido",
    rut: "RUT",
    edad: "Edad",
    region: "Región",
    comuna: "Comuna",
    ciudad: "Ciudad",
    direccion: "Dirección",
    telefono: "Teléfono",
    nombre_contacto_emergencia: "Contacto de emergencia",
    telefono_contacto_emergencia: "Teléfono de emergencia",
    motivo_consulta: "Motivo de consulta",
    diagnostico: "Diagnóstico",
    sintomas: "Síntomas",
    horarios: "Horario",
    arancel: "Arancel",
    prevision: "Previsión",
    modalidad: "Modalidad",
    psicologo_varon: "Psicólogo varón",
    practicante: "Practicante",
    pregunta: "Pregunta adicional",
    // Campos de terapeutas actualizados
    nombre: "Nombre",
    apellido: "Apellido",
    tipo_terapeuta: "Tipo de Terapeuta",
    especialidad: "Especialidad",
    region: "Región",
    comuna: "Comuna",
    lugar_atencion: "Lugar de Atención",
    valor_consulta: "Valor Consulta",
    descripcion: "Descripción",
    rut: "RUT",
    edad_atencion: "Edad de Atención",
    tipo_atencion: "Tipo de Atención",
    horarios: "Horarios Disponibles",
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
                      if (key === "id" || key === "created_at") return null;
                      if (!isExpanded && !previewFields.includes(key))
                        return null;

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
      </div>

      {activeTab === "pacientes"
        ? renderCards(pacientes, previewFieldsPacientes)
        : renderCards(terapeutas, previewFieldsTerapeutas)}
    </div>
  );
}

export default Dashboard;

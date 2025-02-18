import React, { useEffect, useState } from "react";
import { pacientesApi } from "../../services/pacientesApi"; // Añadir esta importación

function Dashboard() {
  const [formDataList, setFormDataList] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const pacientes = await pacientesApi.getAll();
        setFormDataList(pacientes);
      } catch (error) {
        console.error("Error al obtener pacientes:", error);
        setFormDataList([]);
        console.log(1)
      }
    };

    fetchPacientes();
  }, []);

  const previewFields = [
    "nombre",
    "apellido",
    "telefono",
    "arancel",
    "comuna",
    "horarios",
  ];

  if (formDataList.length === 0) {
    return <div className="container mt-4">No hay datos para mostrar</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="display-4 mb-4">Datos de Pacientes</h1>
      <div className="row g-4">
        {formDataList.map((formData, index) => {
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
                {/* Encabezado de la tarjeta */}
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    {formData.nombre} {formData.apellido}
                  </h5>
                </div>

                {/* Cuerpo de la tarjeta */}
                <div className="card-body">
                  <div
                    className={`row g-3 ${
                      isExpanded
                        ? "row-cols-1 row-cols-sm-2 row-cols-md-3"
                        : "row-cols-1"
                    }`}
                  >
                    {Object.entries(formData).map(([key, value]) => {
                      if (key === "submitTime") return null;
                      if (!isExpanded && !previewFields.includes(key)) {
                        return null;
                      }

                      const fieldName =
                        key
                          .replace(/_field/g, "")
                          .replace(/_/g, " ")
                          .charAt(0)
                          .toUpperCase() +
                        key
                          .slice(1)
                          .replace(/_field/g, "")
                          .replace(/_/g, " ");

                      return (
                        <div key={key} className="col">
                          <div className="p-3 bg-light rounded h-100">
                            <h6 className="text-muted mb-1 text-break">
                              {fieldName}
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

                {/* Pie de la tarjeta */}
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
    </div>
  );
}

export default Dashboard;

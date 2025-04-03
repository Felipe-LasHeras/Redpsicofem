import React, { useState, useEffect } from "react";

function ProfileForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
    region: "",
    comuna: "",
    lugarAtencion: "",
    valorConsulta: "",
    descripcionPersonal: "",
    perfilReservo: "",
    tipoTerapeuta: "",
  });

  useEffect(() => {
    const fetchTerapeutaData = async () => {
      try {
        const response = await fetch("/api/terapeutas/perfil");
        if (!response.ok) {
          throw new Error("Error al obtener datos del terapeuta");
        }
        const terapeutaData = await response.json();
        setFormData({
          nombre: terapeutaData.nombre || "",
          apellido: terapeutaData.apellido || "",
          especialidad: terapeutaData.especialidad || "",
          region: terapeutaData.region || "",
          comuna: terapeutaData.comuna || "",
          lugarAtencion: terapeutaData.lugar_atencion || "",
          valorConsulta: terapeutaData.valor_consulta || "",
          descripcionPersonal: terapeutaData.descripcion || "",
          perfilReservo: terapeutaData.perfil_rrss || "",
          tipoTerapeuta:
            terapeutaData.tipo_terapeuta === 1 ? "interno" : "externo",
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchTerapeutaData();
  }, []);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Perfil del Terapeuta</h3>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {Object.entries(formData).map(([key, value]) => {
                  const fieldNameMap = {
                    nombre: "Nombre",
                    apellido: "Apellido",
                    especialidad: "Especialidad",
                    region: "Región",
                    comuna: "Comuna",
                    lugarAtencion: "Lugar de Atención",
                    valorConsulta: "Valor Consulta",
                    descripcionPersonal: "Descripción Personal",
                    perfilReservo: "Perfil de Reservo",
                    tipoTerapeuta: "Tipo de Terapeuta",
                  };

                  return (
                    <div key={key} className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="text-muted mb-1">{fieldNameMap[key]}</h6>
                        <p className="mb-0">{value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
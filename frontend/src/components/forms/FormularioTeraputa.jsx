import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { terapeutasApi } from "../../services/terapeutasApi";

const FormularioTerapeuta = () => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState({ tipo: "", contenido: "" });
  const [formData, setFormData] = useState({});

  const formFields = [
    {
      type: "text",
      label: "Nombre",
      required: true,
      id: "nombre_field",
    },
    {
      type: "text",
      label: "Apellido",
      required: true,
      id: "apellido_field",
    },
    {
      type: "dropdown",
      label: "Tipo de Terapeuta",
      required: true,
      id: "tipo_terapeuta_field",
      options: ["Redpsicofem", "Red derivacion"],
    },
    {
      type: "text",
      label: "Especialidad",
      required: true,
      id: "especialidad_field",
    },
    {
      type: "text",
      label: "Región",
      required: true,
      id: "region_field",
    },
    {
      type: "text",
      label: "Comuna",
      required: true,
      id: "comuna_field",
    },
    {
      type: "text",
      label: "Lugar de Atención",
      required: true,
      id: "lugar_atencion_field",
    },
    {
      type: "number",
      label: "Valor Consulta",
      required: true,
      id: "valor_consulta_field",
    },
    {
      type: "textarea",
      label: "Descripción",
      required: true,
      id: "descripcion_field",
    },
    {
      type: "text",
      label: "RUT",
      required: true,
      id: "rut_field",
    },
    {
      type: "dropdown",
      label: "Edad de Atención",
      required: true,
      id: "edad_atencion_field",
      options: ["18-25", "26-35", "36-45"],
    },
    {
      type: "dropdown",
      label: "Tipo de Atención",
      required: true,
      id: "tipo_atencion_field",
      options: ["Online", "Presencial", "Ambos"],
    },
    {
      type: "checkbox-group",
      label: "Horarios disponibles",
      required: true,
      id: "horarios_field",
      options: [
        { label: "09:00 - 10:00", value: "09:00-10:00" },
        { label: "10:00 - 11:00", value: "10:00-11:00" },
        { label: "11:00 - 12:00", value: "11:00-12:00" },
        { label: "12:00 - 13:00", value: "12:00-13:00" },
        { label: "15:00 - 16:00", value: "15:00-16:00" },
        { label: "16:00 - 17:00", value: "16:00-17:00" },
      ],
    },
  ];

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [id]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const horariosSeleccionados = Object.entries(formData)
        .filter(([key, value]) => key.startsWith("horarios_field_") && value)
        .map(([key]) => key.replace("horarios_field_", ""));

      const terapeutaData = {
        nombre: formData.nombre_field,
        apellido: formData.apellido_field,
        tipo_terapeuta: formData.tipo_terapeuta_field === "Redpsicofem",
        especialidad: formData.especialidad_field,
        region: formData.region_field,
        comuna: formData.comuna_field,
        lugar_atencion: formData.lugar_atencion_field,
        valor_consulta: parseInt(formData.valor_consulta_field),
        descripcion: formData.descripcion_field,
        rut: formData.rut_field,
        edad_atencion: formData.edad_atencion_field,
        tipo_atencion: formData.tipo_atencion_field,
        horarios: horariosSeleccionados.join(", "),
      };

      const response = await terapeutasApi.create(terapeutaData);

      if (response.success) {
        setMensaje({
          tipo: "success",
          contenido: "¡Terapeuta registrado exitosamente!",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      setMensaje({
        tipo: "error",
        contenido: `Error: ${
          error.message || "Hubo un error al guardar los datos"
        }`,
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Registro de Terapeuta</h3>
            </div>
            <div className="card-body">
              {mensaje.contenido && (
                <div
                  className={`alert alert-${
                    mensaje.tipo === "success" ? "success" : "danger"
                  } mb-4`}
                >
                  {mensaje.contenido}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {formFields.map((field) => (
                    <div
                      key={field.id}
                      className={
                        field.type === "textarea" ? "col-12" : "col-md-6"
                      }
                    >
                      <div className="form-group">
                        <label htmlFor={field.id} className="form-label">
                          {field.label}
                          {field.required && (
                            <span className="text-danger">*</span>
                          )}
                        </label>

                        {field.type === "checkbox-group" ? (
                          <div className="row g-2">
                            {field.options?.map((option) => (
                              <div key={option.value} className="col-md-6">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`${field.id}_${option.value}`}
                                    value={option.value}
                                    onChange={handleChange}
                                    checked={
                                      formData[`${field.id}_${option.value}`] ||
                                      false
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`${field.id}_${option.value}`}
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : field.type === "dropdown" ? (
                          <select
                            id={field.id}
                            className="form-select"
                            value={formData[field.id] || ""}
                            onChange={handleChange}
                            required={field.required}
                          >
                            <option value="">Seleccione una opción</option>
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            className="form-control"
                            id={field.id}
                            value={formData[field.id] || ""}
                            onChange={handleChange}
                            required={field.required}
                            rows="3"
                          />
                        ) : (
                          <input
                            type={field.type}
                            className="form-control"
                            id={field.id}
                            value={formData[field.id] || ""}
                            onChange={handleChange}
                            required={field.required}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">
                    Registrar Terapeuta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioTerapeuta;

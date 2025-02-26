import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pacientesApi } from "../../services/pacientesApi.js";
import { camposApi } from "../../services/camposApi.js";
import { regiones } from "../../components/common/RegionesyComunas";

const ClientForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [formData, setFormData] = useState({});
  
  // Este estado contendrá todos los campos del formulario (fijos + dinámicos)
  const [allFields, setAllFields] = useState([]);

  // Campos fijos del formulario
  const [formFields] = useState([
    {
      type: "text",
      label: "Correo",
      required: true,
      id: "email_field",
    },
    {
      type: "text",
      label: "Nombre",
      required: true,
      id: "name_field",
    },
    {
      type: "text",
      label: "Apellido",
      required: true,
      id: "last_name_field",
    },
    {
      type: "text",
      label: "Rut",
      required: true,
      id: "rut_field",
    },
    {
      type: "text",
      label: "Edad",
      required: true,
      id: "age_field",
    },
    {
      type: "dropdown",
      label: "Region",
      required: true,
      id: "Region_field",
      options: regiones.map((region) => region.nombre),
    },
    {
      type: "dropdown",
      label: "Comuna",
      required: true,
      id: "Comuna_field",
      options: comunasDisponibles,
    },
    {
      type: "text",
      label: "Ciudad",
      required: true,
      id: "Ciudad_field",
    },
    {
      type: "text",
      label: "Direccion",
      required: true,
      id: "Direccion_field",
    },
    {
      type: "text",
      label: "Telefono",
      required: true,
      id: "Telefono_field",
    },
    {
      type: "text",
      label: "Nombre contacto de emergencia",
      required: true,
      id: "Nombre_contacto_emergencia_field",
    },
    {
      type: "text",
      label: "Telefono contacto de emergencia",
      required: true,
      id: "Telefono_contacto_emergencia_field",
    },
    {
      type: "text",
      label: "Motivo consulta",
      required: true,
      id: "Motivo_consulta_field",
    },
    {
      type: "text",
      label: "Diagnostico",
      required: true,
      id: "diagnostico_field",
    },
    {
      type: "text",
      label: "Sintomas",
      required: true,
      id: "Sintomas_field",
    },
    {
      type: "checkbox-group",
      label: "Horarios disponibles",
      required: true,
      id: "horarios_field",
      options: [
        {
          label: "09:00 - 10:00",
          value: "09:00-10:00",
        },
        {
          label: "10:00 - 11:00",
          value: "10:00-11:00",
        },
        {
          label: "11:00 - 12:00",
          value: "11:00-12:00",
        },
        {
          label: "12:00 - 13:00",
          value: "12:00-13:00",
        },
        {
          label: "15:00 - 16:00",
          value: "15:00-16:00",
        },
        {
          label: "16:00 - 17:00",
          value: "16:00-17:00",
        },
      ],
    },
    {
      type: "dropdown",
      label: "Arancel",
      required: true,
      id: "Arancel_field",
      options: [
        "Arancel equipo clínico REDPSICOFEM desde $30.000 a $35.000 (o red de derivacion)",
        "Arancel Diferencial (Red Derivacion) $25.000-29.000",
        "Arancel mayor $35.000-$40.000",
      ],
    },
    {
      type: "dropdown",
      label: "Prevision",
      required: true,
      id: "Prevision_field",
      options: ["Fonasa", "Isapre"],
    },
    {
      type: "dropdown",
      label: "Modalidad",
      required: true,
      id: "Modalidad_field",
      options: [
        "Atencion remota",
        "Atencion Presencial",
        "Me da igual (remota o presencial)",
      ],
    },
    {
      type: "dropdown",
      label: "Psicologe varón",
      required: true,
      id: "Psicologe_varon_field",
      options: ["Si", "No"],
    },
    {
      type: "checkbox-group",
      label: "practicante",
      required: true,
      id: "practicante_field",
      options: [
        {
          label: "Si",
          value: "Si",
        },
        {
          label: "No",
          value: "No",
        },
      ],
    },
    {
      type: "text",
      label: "Pregunta",
      required: true,
      id: "Pregunta_field",
    },
  ]);

  // Carga los campos dinámicos desde la API
  useEffect(() => {
    const cargarCamposDinamicos = async () => {
      try {
        const campos = await camposApi.getActivos();
        // Convierte los campos de la API al formato que espera el formulario
        const camposFormateados = campos.map(campo => ({
          id: `dinamico_${campo.nombre_campo}`,
          label: campo.etiqueta,
          type: campo.tipo,
          required: campo.requerido,
          options: campo.opciones,
          categoria: campo.categoria,
          orden: campo.orden,
          campo_id: campo.id, // guardamos el id original para referencia
          dinamico: true // marcamos que es un campo dinámico
        }));
        
        setCamposDinamicos(camposFormateados);
      } catch (error) {
        console.error("Error al cargar campos dinámicos:", error);
      }
    };

    cargarCamposDinamicos();
  }, []);

  // Combinamos los campos fijos con los dinámicos cuando estos últimos cambian
  useEffect(() => {
    // Combinar campos fijos y dinámicos y ordenarlos
    const campos = [...formFields, ...camposDinamicos].sort((a, b) => {
      // Los campos dinámicos tienen prioridad en el orden
      if (a.dinamico && b.dinamico) {
        return a.orden - b.orden;
      }
      // Los campos dinámicos van después de los fijos
      if (a.dinamico && !b.dinamico) {
        return 1;
      }
      if (!a.dinamico && b.dinamico) {
        return -1;
      }
      // Por defecto, mantener el orden de los campos fijos
      return 0;
    });
    
    setAllFields(campos);
  }, [formFields, camposDinamicos]);

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

      if (id === "Region_field") {
        const regionSeleccionada = regiones.find(
          (region) => region.nombre === value
        );

        if (regionSeleccionada) {
          setComunasDisponibles(regionSeleccionada.comunas);

          setFormData((prev) => ({
            ...prev,
            Comuna_field: "",
          }));
        }
      }
    }
  };

  const nextStep = () => {
    if (step < allFields.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Procesar datos de campos fijos
      const horariosSeleccionados = Object.entries(formData)
        .filter(([key, value]) => key.startsWith("horarios_field_") && value)
        .map(([key]) => key.replace("horarios_field_", ""));
  
      const horarioSeleccionado = horariosSeleccionados[0];
  
      const pacienteData = {
        email: formData.email_field,
        nombre: formData.name_field,
        apellido: formData.last_name_field,
        rut: formData.rut_field,
        edad: formData.age_field,
        region: formData.Region_field,
        comuna: formData.Comuna_field,
        ciudad: formData.Ciudad_field,
        direccion: formData.Direccion_field,
        telefono: formData.Telefono_field,
        nombre_contacto_emergencia: formData.Nombre_contacto_emergencia_field,
        telefono_contacto_emergencia:
          formData.Telefono_contacto_emergencia_field,
        motivo_consulta: formData.Motivo_consulta_field,
        diagnostico: formData.diagnostico_field,
        sintomas: formData.Sintomas_field,
        horarios: horarioSeleccionado,
        arancel: formData.Arancel_field,
        prevision: formData.Prevision_field,
        modalidad: formData.Modalidad_field,
        psicologo_varon: formData.Psicologe_varon_field === "Si",
        practicante: formData[`practicante_field_Si`] === true,
        pregunta: formData.Pregunta_field,
      };
  
      // Procesar datos de campos dinámicos
      const camposDinamicosData = {};
      
      camposDinamicos.forEach(campo => {
        const id = campo.id;
        const nombreCampo = campo.id.replace('dinamico_', '');
        
        if (campo.type === 'checkbox-group') {
          // Para grupos de checkbox, buscamos todos los valores seleccionados
          const valoresSeleccionados = Object.entries(formData)
            .filter(([key, value]) => key.startsWith(`${id}_`) && value)
            .map(([key]) => key.replace(`${id}_`, ''));
            
          camposDinamicosData[nombreCampo] = valoresSeleccionados;
        } else {
          // Para otros tipos de campo, simplemente tomamos el valor
          camposDinamicosData[nombreCampo] = formData[id] || null;
        }
      });
  
      // Enviar datos completos
      const datosCompletos = {
        ...pacienteData,
        campos_dinamicos: camposDinamicosData
      };
  
      const response = await pacientesApi.create(datosCompletos);
  
      if (response.success) {
        setFormData({});
        // Redireccionar a la página de agradecimiento
        navigate("/gracias");
      } else {
        throw new Error(response.message || "Error al guardar los datos");
      }
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      alert(
        `Error: ${
          error.message ||
          "Hubo un error al guardar los datos. Por favor intente nuevamente."
        }`
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step < allFields.length - 1) {
        nextStep();
      } else {
        handleSubmit(e);
      }
    }
  };

  const renderField = (field) => {
    if (field.id === "Comuna_field") {
      console.log("Comunas disponibles al renderizar:", comunasDisponibles);
    }

    return (
      <div className="mb-4">
        <label htmlFor={field.id} className="form-label fw-semibold">
          {field.label}
          {field.required && <span className="text-info ms-1">*</span>}
        </label>

        {field.type === "checkbox-group" ? (
          <div className="row row-cols-1 row-cols-md-2 g-3">
            {field.options?.map((option) => (
              <div key={option.value} className="col">
                <div className="p-3 bg-light rounded h-100">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`${field.id}_${option.value}`}
                      value={option.value}
                      name={field.id}
                      onChange={handleChange}
                      checked={formData[`${field.id}_${option.value}`] || false}
                    />
                    <label
                      className="form-check-label w-100"
                      htmlFor={`${field.id}_${option.value}`}
                    >
                      <h6 className="mb-0">{option.label}</h6>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : field.type === "dropdown" ? (
          <select
            id={field.id}
            className="form-select form-select-lg bg-light"
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
          >
            <option value="">Seleccione una opción</option>
            {field.id === "Comuna_field"
              ? comunasDisponibles.map((comuna) => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))
              : field.options?.map((option) => (
                  <option key={typeof option === 'object' ? option.value : option} 
                          value={typeof option === 'object' ? option.value : option}>
                    {typeof option === 'object' ? option.label : option}
                  </option>
                ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            className="form-control form-control-lg bg-light"
            id={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            rows="4"
          />
        ) : field.type === "date" ? (
          <input
            type="date"
            className="form-control form-control-lg bg-light"
            id={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
          />
        ) : (
          <input
            type={field.type}
            className="form-control form-control-lg bg-light"
            id={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-white p-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <h2 className="text-center mb-4">
              ¿Buscas atención psicológica en REDPSICOFEM?
            </h2>

            <div className="mb-4">
              <div className="progress" style={{ height: "4px" }}>
                <div
                  className="progress-bar bg-info"
                  role="progressbar"
                  style={{
                    width: `${((step + 1) / allFields.length) * 100}%`,
                  }}
                  aria-valuenow={((step + 1) / allFields.length) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <small className="text-muted mt-2 d-block">
                {step + 1}/{allFields.length}
              </small>
            </div>

            <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
              {allFields.length > 0 && renderField(allFields[step])}

              <div className="d-flex justify-content-between align-items-center mt-4">
                <small className="text-muted fst-italic">Presione ENTRAR</small>
                <div className="d-flex gap-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn btn-outline-secondary"
                    >
                      Atrás
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={
                      step < allFields.length - 1 ? nextStep : handleSubmit
                    }
                    className="btn btn-info text-white"
                  >
                    {step < allFields.length - 1 ? "PRÓXIMO" : "ENVIAR"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
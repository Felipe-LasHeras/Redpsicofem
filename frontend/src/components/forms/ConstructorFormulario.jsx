import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pacientesApi } from '../../services/pacientesApi.js';

const ClientForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  const [formFields] = useState([
    {
      type: 'text',
      label: 'Correo',
      required: true,
      id: 'email_field'
    },
    {
      type: 'text',
      label: 'Nombre',
      required: true,
      id: 'name_field'
    },
    {
      type: 'text',
      label: 'Apellido',
      required: true,
      id: 'last_name_field'
    },
    {
      type: 'text',
      label: 'Rut',
      required: true,
      id: 'rut_field'
    },
    {
      type: 'text',
      label: 'Edad',
      required: true,
      id: 'age_field'
    },
    {
      type: 'dropdown',
      label: 'Region',
      required: true,
      id: 'Region_field',
      options: ['1', '2', '3']
    },
    {
      type: 'dropdown',
      label: 'Comuna',
      required: true,
      id: 'Comuna_field',
      options: ['1', '2', '3']
    },
    {
      type: 'dropdown',
      label: 'Ciudad',
      required: true,
      id: 'Ciudad_field',
      options: ['1', '2', '3']
    },
    {
      type: 'text',
      label: 'Direccion',
      required: true,
      id: 'Direccion_field'
    },
    {
      type: 'text',
      label: 'Telefono',
      required: true,
      id: 'Telefono_field'
    },
    {
      type: 'text',
      label: 'Nombre contacto de emergencia',
      required: true,
      id: 'Nombre_contacto_emergencia_field'
    },
    {
      type: 'text',
      label: 'Telefono contacto de emergencia',
      required: true,
      id: 'Telefono_contacto_emergencia_field'
    },
    {
      type: 'text',
      label: 'Motivo consulta',
      required: true,
      id: 'Motivo_consulta_field'
    },
    {
      type: 'text',
      label: 'diagnostico',
      required: true,
      id: 'diagnostico_field'
    },
    {
      type: 'text',
      label: 'Sintomas',
      required: true,
      id: 'Sintomas_field'
    },
    {
      type: 'time',
      label: 'horarios',
      required: true,
      id: 'horarios_field'
    },
    {
      type: 'dropdown',
      label: 'Arancel',
      required: true,
      id: 'Arancel_field',
      options: ['1', '2', '3']
    },
    {
      type: 'text',
      label: 'Prevision',
      required: true,
      id: 'Prevision_field'
    },
    {
      type: 'text',
      label: 'Modalidad',
      required: true,
      id: 'Modalidad_field'
    },
    {
      type: 'text',
      label: 'Psicologo varon',
      required: true,
      id: 'Psicologo_varon_field'
    },
    {
      type: 'checkbox-group',
      label: 'practicante',
      required: true,
      id: 'practicante_field',
      options: [
        {
          label: 'Si',
          value: 'Si'
        },
        {
          label: 'No',
          value: 'No'
        }
      ]
    },
    {
      type: 'text',
      label: 'Pregunta',
      required: true,
      id: 'Pregunta_field'
    }
  ]);

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [id]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const nextStep = () => {
    if (step < formFields.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
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
        telefono_contacto_emergencia: formData.Telefono_contacto_emergencia_field,
        motivo_consulta: formData.Motivo_consulta_field,
        diagnostico: formData.diagnostico_field,
        sintomas: formData.Sintomas_field,
        horarios: formData.horarios_field,
        arancel: formData.Arancel_field,
        prevision: formData.Prevision_field,
        modalidad: formData.Modalidad_field,
        psicologo_varon: formData.Psicologo_varon_field,
        practicante: formData[`practicante_field_Si`] ? 'Si' : 'No',
        pregunta: formData.Pregunta_field
      };

      await pacientesApi.create(pacienteData);
      setFormData({});
      alert('Paciente registrado exitosamente');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al guardar los datos:', error);
      alert('Hubo un error al guardar los datos. Por favor intente nuevamente.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step < formFields.length - 1) {
        nextStep();
      } else {
        handleSubmit(e);
      }
    }
  };

  const renderField = (field) => {
    return (
      <div className="mb-4">
        <label htmlFor={field.id} className="form-label fw-semibold">
          {field.label}
          {field.required && <span className="text-info ms-1">*</span>}
        </label>
        
        {field.type === 'dropdown' ? (
          <select
            id={field.id}
            className="form-select form-select-lg bg-light"
            value={formData[field.id] || ''}
            onChange={handleChange}
            required={field.required}
          >
            <option value="">Seleccione una opción</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : field.type === 'checkbox-group' ? (
          <div className="d-flex gap-4">
            {field.options?.map((option) => (
              <div key={option.value} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`${field.id}_${option.value}`}
                  value={option.value}
                  name={field.id}
                  onChange={handleChange}
                  checked={formData[`${field.id}_${option.value}`] || false}
                />
                <label className="form-check-label" htmlFor={`${field.id}_${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <input
            type={field.type}
            className="form-control form-control-lg bg-light"
            id={field.id}
            value={formData[field.id] || ''}
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
            <h2 className="text-center mb-4">¿Buscas atención psicológica en REDPSICOFEM?</h2>
            
            <div className="mb-4">
              <div className="progress" style={{height: "4px"}}>
                <div 
                  className="progress-bar bg-info"
                  role="progressbar"
                  style={{ width: `${((step + 1) / formFields.length) * 100}%` }}
                  aria-valuenow={((step + 1) / formFields.length) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                </div>
              </div>
              <small className="text-muted mt-2 d-block">
                {step + 1}/{formFields.length}
              </small>
            </div>

            <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
              {renderField(formFields[step])}

              <div className="d-flex justify-content-between align-items-center mt-4">
                <small className="text-muted fst-italic">
                  Presione ENTRAR
                </small>
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
                    onClick={step < formFields.length - 1 ? nextStep : handleSubmit}
                    className="btn btn-info text-white"
                  >
                    {step < formFields.length - 1 ? 'PRÓXIMO' : 'ENVIAR'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-muted small">
        Made with forms.app
      </div>
    </div>
  );
};

export default ClientForm;
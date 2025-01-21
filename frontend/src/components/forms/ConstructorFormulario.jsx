import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ClientForm = () => {
  const navigate = useNavigate();
  
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
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Agregar timestamp al formulario
      const formDataWithTimestamp = {
        ...formData,
        submitTime: new Date().toISOString()
      };

      // Obtener la lista existente del localStorage o crear una nueva si no existe
      let formDataList = [];
      const existingData = localStorage.getItem('formDataList');
      
      if (existingData) {
        try {
          formDataList = JSON.parse(existingData);
          if (!Array.isArray(formDataList)) {
            formDataList = [];
          }
        } catch (error) {
          console.error('Error parsing existing data:', error);
          formDataList = [];
        }
      }

      // Agregar los nuevos datos a la lista
      formDataList.push(formDataWithTimestamp);

      // Guardar la lista actualizada en localStorage
      localStorage.setItem('formDataList', JSON.stringify(formDataList));

      // Limpiar el formulario actual
      setFormData({});

      // Navegar al dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving form data:', error);
      alert('Hubo un error al guardar los datos. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Formulario de Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id} className="flex flex-col">
            <label htmlFor={field.id} className="mb-2">
              {field.label}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                id={field.id}
                required={field.required}
                className="border p-2 rounded"
                onChange={handleChange}
                value={formData[field.id] || ''}
              />
            )}
            
            {field.type === 'dropdown' && (
              <select 
                id={field.id}
                required={field.required}
                className="border p-2 rounded"
                onChange={handleChange}
                value={formData[field.id] || ''}
              >
                <option value="">Seleccione una opción</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'time' && (
              <input
                type="time"
                id={field.id}
                required={field.required}
                className="border p-2 rounded"
                onChange={handleChange}
                value={formData[field.id] || ''}
              />
            )}
            
            {field.type === 'checkbox-group' && (
              <div className="flex gap-4">
                {field.options?.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`${field.id}_${option.value}`}
                      value={option.value}
                      name={field.id}
                      onChange={handleChange}
                      checked={formData[`${field.id}_${option.value}`] || false}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ClientForm;
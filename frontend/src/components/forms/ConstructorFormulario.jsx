import React, { useState } from "react";

const ConstructorFormulario = () => {
  const [formFields, setFormFields] = useState([
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
}
export default ConstructorFormulario;


import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [formDataList, setFormDataList] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('formDataList');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormDataList(Array.isArray(parsedData) ? parsedData : []);
      } catch (error) {
        console.error('Error parsing saved data:', error);
        setFormDataList([]);
      }
    }
  }, []);

  const previewFields = [
    'name_field',
    'last_name_field',
    'horarios_field',
    'Arancel_field',
    'Comuna_field'
  ];

  if (formDataList.length === 0) {
    return <div className="p-6">No hay datos para mostrar</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Datos de Pacientes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formDataList.map((formData, index) => (
          <div 
            key={index}
            className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
              expandedCard === index ? 'col-span-full' : ''
            }`}
          >
            {/* Contenido principal de la tarjeta */}
            <div className="p-6">
              <h2 className="font-bold text-xl mb-4 text-gray-800">
                {formData.name_field} {formData.last_name_field}
              </h2>
              
              <div className={`grid gap-4 ${
                expandedCard === index ? 'grid-cols-3' : 'grid-cols-1'
              }`}>
                {Object.entries(formData).map(([key, value]) => {
                  if (key === 'submitTime') return null;
                  if (expandedCard !== index && !previewFields.includes(key)) {
                    return null;
                  }

                  const fieldName = key
                    .replace(/_field/g, '')
                    .replace(/_/g, ' ')
                    .charAt(0).toUpperCase() + 
                    key.slice(1).replace(/_field/g, '').replace(/_/g, ' ');

                  return (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h3 className="font-medium text-sm text-gray-600 mb-1">{fieldName}</h3>
                      <p className="text-gray-800">
                        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value || 'No especificado'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botón en la parte inferior */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                {expandedCard === index ? 'Ver menos' : 'Ver más'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
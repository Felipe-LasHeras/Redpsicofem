const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.SUPABASE_FUNCTIONS_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Log de configuración
console.log('Configuración:');
console.log(`URL API: ${API_URL}`);
console.log(`ANON_KEY: ${ANON_KEY ? ANON_KEY.substring(0, 5) + '...' + ANON_KEY.substring(ANON_KEY.length - 5) : 'NO CONFIGURADA'}`);

async function testEndpoints() {
  const endpoints = [
    { name: 'Pacientes', url: `${API_URL}/pacientes` },
    { name: 'Terapeutas', url: `${API_URL}/terapeutas` },
    { name: 'Campos', url: `${API_URL}/campos` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nProbando endpoint: ${endpoint.name} (${endpoint.url})`);
      console.log('Headers utilizados:');
      console.log('- apikey: ' + (ANON_KEY ? ANON_KEY.substring(0, 3) + '...' : 'NO CONFIGURADO'));
      console.log('- Authorization: Bearer ' + (ANON_KEY ? ANON_KEY.substring(0, 3) + '...' : 'NO CONFIGURADO'));
      
      const response = await axios.get(endpoint.url, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      console.log(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`);
      console.log(`   Total elementos: ${Array.isArray(response.data) ? response.data.length : '1 (objeto)'}`);
      console.log(`   Muestra de respuesta: ${JSON.stringify(response.data.slice ? response.data.slice(0, 1) : response.data).substring(0, 100)}...`);
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ERROR`);
      
      if (error.response) {
        // La solicitud se hizo y el servidor respondió con un código de estado
        // que no está en el rango 2xx
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data)}`);
        console.error(`   Headers: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error('   No se recibió respuesta del servidor');
      } else {
        // Algo ocurrió en la configuración de la solicitud que desencadenó un error
        console.error(`   Error de configuración: ${error.message}`);
      }
    }
  }
}

testEndpoints();
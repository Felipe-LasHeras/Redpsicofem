const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.SUPABASE_FUNCTIONS_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testEndpoints() {
  const endpoints = [
    { name: 'Pacientes', url: `${API_URL}/pacientes` },
    { name: 'Terapeutas', url: `${API_URL}/terapeutas` },
    { name: 'Campos', url: `${API_URL}/campos` }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Probando endpoint: ${endpoint.name}`);
      
      const response = await axios.get(endpoint.url, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      console.log(`✅ ${endpoint.name}: ${response.status} OK`);
      console.log(`Recibidos ${Array.isArray(response.data) ? response.data.length : 1} elementos`);
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ERROR`, error.response?.data || error.message);
    }
  }
}

testEndpoints();
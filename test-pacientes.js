const fetch = require('node-fetch');

const API_URL = "https://tqqparrybsicbansodrc.supabase.co/functions/v1";
const ANON_KEY = "tu-clave-anon-aquí"; // Reemplaza con tu clave

async function testCreatePaciente() {
  const pacienteData = {
    nombre: "Test",
    apellido: "Paciente",
    email: "test@example.com"
  };

  try {
    const response = await fetch(`${API_URL}/pacientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(pacienteData)
    });

    const result = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${result}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

testCreatePaciente();
const API_URL = process.env.REACT_APP_API_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log para depuración - sólo se ejecuta una vez al cargar
console.log("Config API Pacientes:", {
  API_URL: API_URL ? `${API_URL.substring(0, 15)}...` : "no configurado",
  ANON_KEY: ANON_KEY ? `${ANON_KEY.substring(0, 5)}...${ANON_KEY.substring(ANON_KEY.length - 5)}` : "no configurado"
});

// Función para validar configuración
const validarConfig = () => {
  if (!API_URL || !ANON_KEY) {
    console.error("Error: Variables de entorno no configuradas correctamente para pacientesApi");
    console.log("API_URL:", API_URL);
    console.log("ANON_KEY:", ANON_KEY ? `${ANON_KEY.substring(0, 5)}...` : "no definido");
    return false;
  }
  return true;
};

export const pacientesApi = {
  // Obtener todos los pacientes
  getAll: async () => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/pacientes`);
      const response = await fetch(`${API_URL}/pacientes`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      // Capturar errores HTTP
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
          console.error("No se pudo parsear respuesta de error:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      throw error;
    }
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/pacientes/${id}`);
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("No se pudo parsear respuesta de error:", e);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al obtener paciente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear nuevo paciente
  create: async (pacienteData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando POST a ${API_URL}/pacientes`);
      console.log("Datos enviados:", JSON.stringify(pacienteData).substring(0, 100) + "...");
      
      const response = await fetch(`${API_URL}/pacientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(pacienteData)
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error("No se pudo parsear respuesta de error:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Error al crear paciente:", error);
      throw error;
    }
  },

  // Actualizar paciente
  update: async (id, pacienteData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando PUT a ${API_URL}/pacientes/${id}`);
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(pacienteData)
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error("No se pudo parsear respuesta de error:", e);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al actualizar paciente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar paciente
  delete: async (id) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando DELETE a ${API_URL}/pacientes/${id}`);
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error("No se pudo parsear respuesta de error:", e);
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error al eliminar paciente con ID ${id}:`, error);
      throw error;
    }
  },
};
const API_URL = process.env.REACT_APP_API_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log para depuración - sólo se ejecuta una vez al cargar
console.log("Config API Terapeutas:", {
  API_URL: API_URL ? `${API_URL.substring(0, 15)}...` : "no configurado",
  ANON_KEY: ANON_KEY ? `${ANON_KEY.substring(0, 5)}...${ANON_KEY.substring(ANON_KEY.length - 5)}` : "no configurado"
});

// Función para validar configuración
const validarConfig = () => {
  if (!API_URL || !ANON_KEY) {
    console.error("Error: Variables de entorno no configuradas correctamente para terapeutasApi");
    console.log("API_URL:", API_URL);
    console.log("ANON_KEY:", ANON_KEY ? `${ANON_KEY.substring(0, 5)}...` : "no definido");
    return false;
  }
  return true;
};

export const terapeutasApi = {
  getAll: async () => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/terapeutas`);
      const response = await fetch(`${API_URL}/terapeutas`, {
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
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/terapeutas/${id}`);
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
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
      console.error(`Error al obtener terapeuta con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener terapeutas por tipo
  getByTipo: async (tipo) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/terapeutas/tipo/${tipo}`);
      const response = await fetch(`${API_URL}/terapeutas/tipo/${tipo}`, {
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
      console.error(`Error al obtener terapeutas de tipo ${tipo}:`, error);
      throw error;
    }
  },

  create: async (terapeutaData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando POST a ${API_URL}/terapeutas`);
      console.log("Datos enviados:", JSON.stringify(terapeutaData).substring(0, 100) + "...");
      
      const response = await fetch(`${API_URL}/terapeutas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(terapeutaData)
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
      console.error("Error al crear terapeuta:", error);
      throw error;
    }
  },

  update: async (id, terapeutaData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando PUT a ${API_URL}/terapeutas/${id}`);
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(terapeutaData)
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
      console.error(`Error al actualizar terapeuta con ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando DELETE a ${API_URL}/terapeutas/${id}`);
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
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
      console.error(`Error al eliminar terapeuta con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Actualizar solo los horarios de un terapeuta
  updateHorarios: async (id, horariosData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando PATCH a ${API_URL}/terapeutas/${id}/horarios`);
      const response = await fetch(`${API_URL}/terapeutas/${id}/horarios`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(horariosData)
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
      console.error(`Error al actualizar horarios para terapeuta ID ${id}:`, error);
      throw error;
    }
  },
  
  // Verificar si un RUT ya existe
  checkRutExists: async (rut) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      // Obtenemos todos los terapeutas y filtramos por RUT
      const terapeutas = await terapeutasApi.getAll();
      return terapeutas.some(terapeuta => terapeuta.rut === rut);
    } catch (error) {
      console.error('Error en checkRutExists:', error);
      throw error;
    }
  }
};
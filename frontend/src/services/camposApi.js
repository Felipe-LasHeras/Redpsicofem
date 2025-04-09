const API_URL = process.env.REACT_APP_API_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log para depuración - sólo se ejecuta una vez al cargar
console.log("Config API Campos:", {
  API_URL: API_URL ? `${API_URL.substring(0, 15)}...` : "no configurado",
  ANON_KEY: ANON_KEY ? `${ANON_KEY.substring(0, 5)}...${ANON_KEY.substring(ANON_KEY.length - 5)}` : "no configurado"
});

// Función para validar configuración
const validarConfig = () => {
  if (!API_URL || !ANON_KEY) {
    console.error("Error: Variables de entorno no configuradas correctamente para camposApi");
    console.log("API_URL:", API_URL);
    console.log("ANON_KEY:", ANON_KEY ? `${ANON_KEY.substring(0, 5)}...` : "no definido");
    return false;
  }
  return true;
};

export const camposApi = {
  // Obtener todos los campos
  getAll: async () => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/campos`);
      const response = await fetch(`${API_URL}/campos`, {
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

  // Obtener campos activos
  getActivos: async () => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Solicitando GET a ${API_URL}/campos/activos`);
      const response = await fetch(`${API_URL}/campos/activos`, {
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
      console.error("Error en getActivos:", error);
      throw error;
    }
  },

  // Crear nuevo campo
  create: async (campoData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando POST a ${API_URL}/campos`);
      console.log("Datos enviados:", JSON.stringify(campoData).substring(0, 100) + "...");
      
      const response = await fetch(`${API_URL}/campos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(campoData)
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
      console.error("Error al crear campo:", error);
      throw error;
    }
  },

  // Actualizar campo
  update: async (id, campoData) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando PUT a ${API_URL}/campos/${id}`);
      const response = await fetch(`${API_URL}/campos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(campoData)
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
      console.error(`Error al actualizar campo con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar campo
  delete: async (id) => {
    if (!validarConfig()) {
      throw new Error("Error de configuración: Variables de entorno no definidas correctamente");
    }
    
    try {
      console.log(`Enviando DELETE a ${API_URL}/campos/${id}`);
      const response = await fetch(`${API_URL}/campos/${id}`, {
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
      console.error(`Error al eliminar campo con ID ${id}:`, error);
      throw error;
    }
  },
};
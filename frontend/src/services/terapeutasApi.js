const API_URL = "http://localhost:3001/api";

export const terapeutasApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/terapeutas`);
      if (!response.ok) {
        throw new Error("Error al obtener terapeutas");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener el terapeuta");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  // Nueva función para obtener terapeutas por tipo
  getByTipo: async (tipo) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/tipo/${tipo}`);
      if (!response.ok) {
        throw new Error(`Error al obtener terapeutas de tipo ${tipo}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en getByTipo (${tipo}):`, error);
      throw error;
    }
  },

  create: async (terapeutaData) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(terapeutaData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Verificar si es un error de duplicación - Corregido con paréntesis
        if ((response.status === 500 && responseData.error) && 
            (responseData.error.includes('duplicada') || 
             (responseData.details && responseData.details.includes('duplicada')))) {
          throw new Error(`Ya existe un terapeuta con el RUT ${terapeutaData.rut}`);
        }
        
        throw new Error(responseData.error || responseData.message || "Error al crear terapeuta");
      }

      return { success: true, data: responseData };
    } catch (error) {
      console.error("Error detallado:", error);
      throw error;
    }
  },

  update: async (id, terapeutaData) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(terapeutaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar terapeuta");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar terapeuta");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
  
  // Actualizar solo los horarios de un terapeuta
  updateHorarios: async (id, horariosData) => {
    try {
      if (!id) {
        throw new Error("ID de terapeuta no válido");
      }
      
      const response = await fetch(`${API_URL}/terapeutas/${id}/horarios`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(horariosData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar horarios");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en updateHorarios:", error);
      throw error;
    }
  },
  
  // Función para verificar si un RUT ya existe
  checkRutExists: async (rut) => {
    try {
      const allTerapeutas = await terapeutasApi.getAll();
      return allTerapeutas.some(terapeuta => terapeuta.rut === rut);
    } catch (error) {
      console.error("Error verificando RUT existente:", error);
      return false; // Asumimos que no existe en caso de error
    }
  }
};
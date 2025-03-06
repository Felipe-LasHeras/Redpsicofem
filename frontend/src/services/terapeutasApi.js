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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear terapeuta");
      }

      const data = await response.json();
      return { success: true, data };
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
        throw new Error("Error al actualizar terapeuta");
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
        throw new Error("Error al eliminar terapeuta");
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
      const response = await fetch(`${API_URL}/terapeutas/${id}/horarios`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(horariosData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar horarios");
      }
      return await response.json();
    } catch (error) {
      console.error("Error en updateHorarios:", error);
      throw error;
    }
  },
};
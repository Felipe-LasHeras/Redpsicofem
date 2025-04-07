const API_URL = process.env.REACT_APP_API_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const terapeutasApi = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/terapeutas`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener terapeutas');
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener terapeuta');
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Obtener terapeutas por tipo
  getByTipo: async (tipo) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/tipo/${tipo}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error(`Error al obtener terapeutas de tipo ${tipo}`);
      return await response.json();
    } catch (error) {
      console.error('Error en getByTipo:', error);
      throw error;
    }
  },

  create: async (terapeutaData) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(terapeutaData)
      });
      
      if (!response.ok) throw new Error('Error al crear terapeuta');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  update: async (id, terapeutaData) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(terapeutaData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar terapeuta');
      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('Error al eliminar terapeuta');
      return await response.json();
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },
  
  // Actualizar solo los horarios de un terapeuta
  updateHorarios: async (id, horariosData) => {
    try {
      const response = await fetch(`${API_URL}/terapeutas/${id}/horarios`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(horariosData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar horarios');
      return await response.json();
    } catch (error) {
      console.error('Error en updateHorarios:', error);
      throw error;
    }
  },
  
  // Verificar si un RUT ya existe
  checkRutExists: async (rut) => {
    try {
      // Obtenemos todos los terapeutas y filtramos por RUT
      const data = await this.getAll();
      return data.some(terapeuta => terapeuta.rut === rut);
    } catch (error) {
      console.error('Error en checkRutExists:', error);
      throw error;
    }
  }
};
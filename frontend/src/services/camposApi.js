const API_URL = process.env.REACT_APP_API_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const camposApi = {
  // Obtener todos los campos
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/campos`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener campos');
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener campos activos
  getActivos: async () => {
    try {
      const response = await fetch(`${API_URL}/campos/activos`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener campos activos');
      return await response.json();
    } catch (error) {
      console.error('Error en getActivos:', error);
      throw error;
    }
  },

  // Crear nuevo campo
  create: async (campoData) => {
    try {
      const response = await fetch(`${API_URL}/campos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(campoData)
      });
      
      if (!response.ok) throw new Error('Error al crear campo');
      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar campo
  update: async (id, campoData) => {
    try {
      const response = await fetch(`${API_URL}/campos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(campoData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar campo');
      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar campo
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/campos/${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('Error al eliminar campo');
      return await response.json();
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },
};
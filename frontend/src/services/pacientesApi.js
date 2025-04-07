const API_URL = process.env.REACT_APP_API_URL;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const pacientesApi = {
  // Obtener todos los pacientes
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/pacientes`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener pacientes');
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Error al obtener paciente');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear nuevo paciente
  create: async (pacienteData) => {
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
      
      if (!response.ok) throw new Error('Error al crear paciente');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar paciente
  update: async (id, pacienteData) => {
    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(pacienteData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar paciente');
      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar paciente
  delete: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (!response.ok) throw new Error('Error al eliminar paciente');
      return await response.json();
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },
};
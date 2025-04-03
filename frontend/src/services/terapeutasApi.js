import { supabase } from '../config/supabase';

export const terapeutasApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('psicologos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('psicologos')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },

  // Obtener terapeutas por tipo
  getByTipo: async (tipo) => {
    const { data, error } = await supabase
      .from('psicologos')
      .select('*')
      .eq('tipo_terapeuta_nombre', tipo)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  create: async (terapeutaData) => {
    const { data, error } = await supabase
      .from('psicologos')
      .insert([terapeutaData])
      .select();
      
    if (error) throw error;
    return { success: true, data: data[0] };
  },

  update: async (id, terapeutaData) => {
    const { data, error } = await supabase
      .from('psicologos')
      .update(terapeutaData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('psicologos')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return { message: "Terapeuta eliminado exitosamente" };
  },
  
  // Actualizar solo los horarios de un terapeuta
  updateHorarios: async (id, horariosData) => {
    const { data, error } = await supabase
      .from('psicologos')
      .update(horariosData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Verificar si un RUT ya existe
  checkRutExists: async (rut) => {
    const { data, error } = await supabase
      .from('psicologos')
      .select('id')
      .eq('rut', rut);
      
    if (error) throw error;
    return data.length > 0;
  }
};
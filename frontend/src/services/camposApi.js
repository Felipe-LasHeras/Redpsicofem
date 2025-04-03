import { supabase } from '../config/supabase';

export const camposApi = {
  // Obtener todos los campos
  getAll: async () => {
    const { data, error } = await supabase
      .from('configuracion_campos')
      .select('*')
      .order('orden', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  // Obtener campos activos
  getActivos: async () => {
    const { data, error } = await supabase
      .from('configuracion_campos')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  // Crear nuevo campo
  create: async (campoData) => {
    const { data, error } = await supabase
      .from('configuracion_campos')
      .insert([campoData])
      .select();
      
    if (error) throw error;
    return data[0];
  },

  // Actualizar campo
  update: async (id, campoData) => {
    const { data, error } = await supabase
      .from('configuracion_campos')
      .update(campoData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },

  // Eliminar campo
  delete: async (id) => {
    const { error } = await supabase
      .from('configuracion_campos')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return { message: "Campo eliminado exitosamente" };
  },
};
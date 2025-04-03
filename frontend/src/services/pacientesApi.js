import { supabase } from '../config/supabase';

export const pacientesApi = {
  // Obtener todos los pacientes
  getAll: async () => {
    const { data, error } = await supabase
      .from('perfiles_pacientes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('perfiles_pacientes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },

  // Crear nuevo paciente
  create: async (pacienteData) => {
    const { data, error } = await supabase
      .from('perfiles_pacientes')
      .insert([pacienteData])
      .select();
      
    if (error) throw error;
    return { success: true, data: data[0] };
  },

  // Actualizar paciente
  update: async (id, pacienteData) => {
    const { data, error } = await supabase
      .from('perfiles_pacientes')
      .update(pacienteData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  },

  // Eliminar paciente
  delete: async (id) => {
    const { error } = await supabase
      .from('perfiles_pacientes')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return { message: "Paciente eliminado exitosamente" };
  },
};
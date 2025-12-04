import { supabase } from '../config/supabase';

/**
 * AuthService - Servicio de autenticación con Supabase
 * Maneja login con Google, logout, obtención de usuario y perfiles
 */
export const authService = {
  /**
   * Iniciar sesión con Google OAuth
   * Redirige al usuario a Google para autenticarse
   */
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error en signInWithGoogle:', error);
      return { data: null, error };
    }
  },

  /**
   * Cerrar sesión
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error en signOut:', error);
      return { error };
    }
  },

  /**
   * Obtener el usuario actualmente autenticado
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      return { user: null, error };
    }
  },

  /**
   * Obtener la sesión actual
   */
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Error en getSession:', error);
      return { session: null, error };
    }
  },

  /**
   * Obtener el perfil del usuario desde user_profiles
   * Incluye información de rol, estado de aprobación, etc.
   */
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          terapeuta:terapeuta_id (
            id,
            nombre,
            apellido,
            especialidad,
            tipo_terapeuta,
            tipo_terapeuta_nombre
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      return { profile: null, error };
    }
  },

  /**
   * Crear o actualizar el perfil del usuario
   * Se llama automáticamente después del primer login
   */
  upsertUserProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: userId,
            ...profileData,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'id',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Error en upsertUserProfile:', error);
      return { profile: null, error };
    }
  },

  /**
   * Verificar si el email del usuario es el admin
   */
  isAdminEmail: (email) => {
    const adminEmails = [
      'felipe.las.heras@gmail.com',
      'admin@redpsicofem.cl',
    ];
    return adminEmails.includes(email?.toLowerCase());
  },

  /**
   * Crear perfil automáticamente para usuarios nuevos
   * Si es admin, lo marca como aprobado automáticamente
   */
  createUserProfileIfNotExists: async (user) => {
    try {
      // Primero verificar si ya existe
      const { profile: existingProfile } = await authService.getUserProfile(user.id);

      if (existingProfile) {
        return { profile: existingProfile, error: null };
      }

      // Si no existe, crear uno nuevo
      const isAdmin = authService.isAdminEmail(user.email);

      const profileData = {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email,
        status: isAdmin ? 'approved' : 'pending',
        role: isAdmin ? 'admin' : null,
      };

      return await authService.upsertUserProfile(user.id, profileData);
    } catch (error) {
      console.error('Error en createUserProfileIfNotExists:', error);
      return { profile: null, error };
    }
  },

  /**
   * Obtener todos los usuarios pendientes de aprobación (solo admin)
   */
  getPendingUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { users: data, error: null };
    } catch (error) {
      console.error('Error en getPendingUsers:', error);
      return { users: [], error };
    }
  },

  /**
   * Aprobar usuario y asignar rol (solo admin)
   */
  approveUser: async (userId, role, terapeutaId = null) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          status: 'approved',
          role: role,
          terapeuta_id: terapeutaId,
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Si se asignó un terapeuta, actualizar la tabla psicologos
      if (terapeutaId) {
        const { error: terapeutaError } = await supabase
          .from('psicologos')
          .update({
            auth_user_id: userId,
          })
          .eq('id', terapeutaId);

        if (terapeutaError) {
          console.error('Error al actualizar psicologos:', terapeutaError);
        }
      }

      return { user: data, error: null };
    } catch (error) {
      console.error('Error en approveUser:', error);
      return { user: null, error };
    }
  },

  /**
   * Rechazar usuario (solo admin)
   */
  rejectUser: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          status: 'rejected',
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { user: data, error: null };
    } catch (error) {
      console.error('Error en rejectUser:', error);
      return { user: null, error };
    }
  },

  /**
   * Suscribirse a cambios de autenticación
   */
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

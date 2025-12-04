import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

/**
 * AuthContext - Contexto global de autenticación
 * Proporciona el estado de autenticación y funciones relacionadas a toda la app
 */
export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isTerapeuta: false,
  isApproved: false,
  isPending: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar el perfil del usuario
   */
  const loadUserProfile = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      // Primero intentar obtener el perfil
      let { profile: userProfile, error } = await authService.getUserProfile(currentUser.id);

      // Si no existe, crear uno nuevo
      if (error || !userProfile) {
        console.log('Creando perfil para usuario nuevo...');
        const result = await authService.createUserProfileIfNotExists(currentUser);
        userProfile = result.profile;
      }

      setProfile(userProfile);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setProfile(null);
    }
  };

  /**
   * Inicializar la autenticación al montar el componente
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Obtener sesión actual
        const { session } = await authService.getSession();

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error al inicializar auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserProfile(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Iniciar sesión con Google
   */
  const signIn = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signInWithGoogle();

      if (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
      }

      // La redirección la maneja Supabase automáticamente
    } catch (error) {
      console.error('Error en signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar el perfil del usuario
   */
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  // Valores derivados del estado
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin' && profile?.status === 'approved';
  const isTerapeuta =
    (profile?.role === 'terapeuta_red_derivacion' ||
     profile?.role === 'terapeuta_redpsicofem') &&
    profile?.status === 'approved';
  const isApproved = profile?.status === 'approved';
  const isPending = profile?.status === 'pending';

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    isTerapeuta,
    isApproved,
    isPending,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

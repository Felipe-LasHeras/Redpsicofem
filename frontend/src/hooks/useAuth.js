import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth - Hook personalizado para acceder al contexto de autenticación
 *
 * Uso:
 * const { user, profile, isAdmin, isTerapeuta, signIn, signOut } = useAuth();
 *
 * @returns {Object} Objeto con el estado y funciones de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};

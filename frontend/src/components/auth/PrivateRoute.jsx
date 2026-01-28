import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PrivateRoute - Componente que protege rutas que requieren autenticación
 *
 * Uso:
 * <PrivateRoute>
 *   <MiComponenteProtegido />
 * </PrivateRoute>
 *
 * Para rutas de admin:
 * <PrivateRoute requireAdmin>
 *   <DashboardAdmin />
 * </PrivateRoute>
 *
 * Para rutas de terapeuta:
 * <PrivateRoute requireTerapeuta>
 *   <PerfilTerapeuta />
 * </PrivateRoute>
 */
const PrivateRoute = ({ children, requireAdmin = false, requireTerapeuta = false }) => {
  const { user, loading, isAdmin, isTerapeuta, isApproved, isPending } = useAuth();

  // Mostrar loading mientras se carga la autenticación
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está pendiente de aprobación
  if (isPending) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Si el usuario no está aprobado (rejected u otro estado)
  if (!isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Si requiere ser admin y no lo es
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-sm border-0 rounded-lg p-4" style={{ maxWidth: '500px' }}>
          <div className="card-body text-center">
            <div className="mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                fill="currentColor"
                className="bi bi-shield-x text-danger"
                viewBox="0 0 16 16"
              >
                <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
                <path d="M6.146 5.146a.5.5 0 0 1 .708 0L8 6.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 7l1.147 1.146a.5.5 0 0 1-.708.708L8 7.707 6.854 8.854a.5.5 0 1 1-.708-.708L7.293 7 6.146 5.854a.5.5 0 0 1 0-.708z" />
              </svg>
            </div>
            <h5 className="mb-3">Acceso Denegado</h5>
            <p className="text-muted mb-4">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si requiere ser terapeuta y no lo es
  if (requireTerapeuta && !isTerapeuta) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card shadow-sm border-0 rounded-lg p-4" style={{ maxWidth: '500px' }}>
          <div className="card-body text-center">
            <div className="mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                fill="currentColor"
                className="bi bi-shield-x text-danger"
                viewBox="0 0 16 16"
              >
                <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
                <path d="M6.146 5.146a.5.5 0 0 1 .708 0L8 6.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 7l1.147 1.146a.5.5 0 0 1-.708.708L8 7.707 6.854 8.854a.5.5 0 1 1-.708-.708L7.293 7 6.146 5.854a.5.5 0 0 1 0-.708z" />
              </svg>
            </div>
            <h5 className="mb-3">Acceso Denegado</h5>
            <p className="text-muted mb-4">
              Solo los terapeutas pueden acceder a esta página.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si pasa todas las validaciones, renderizar el componente hijo
  return children;
};

export default PrivateRoute;

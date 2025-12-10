import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * AuthCallback - Página que maneja el retorno de OAuth de Google
 * Redirige al usuario según su estado de aprobación y rol
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin, isTerapeuta, isApproved, isPending } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Esperar a que el auth se inicialice
        if (loading) {
          return;
        }

        // Si no hay usuario, redirigir al login
        if (!user) {
          console.log('No hay usuario, redirigiendo a login...');
          navigate('/login', { replace: true });
          return;
        }

        // Si no hay perfil todavía, esperar un poco más
        if (!profile) {
          console.log('Perfil no cargado todavía, esperando...');
          return;
        }

        console.log('Usuario autenticado:', user.email);
        console.log('Perfil:', profile);

        // NUEVO: Verificar si el usuario completó su perfil
        if (!profile.profile_completed) {
          console.log('Usuario no ha completado su perfil, redirigiendo a complete-profile...');
          navigate('/auth/complete-profile', { replace: true });
          return;
        }

        // Decidir a dónde redirigir según el estado del usuario
        if (isPending) {
          console.log('Usuario pendiente de aprobación');
          navigate('/pending-approval', { replace: true });
        } else if (isApproved) {
          if (isAdmin) {
            console.log('Usuario es admin, redirigiendo a dashboard...');
            navigate('/admin/dashboard', { replace: true });
          } else if (isTerapeuta) {
            console.log('Usuario es terapeuta, redirigiendo a perfil...');
            navigate('/terapeuta/perfil', { replace: true });
          } else {
            console.log('Usuario aprobado sin rol específico');
            navigate('/pending-approval', { replace: true });
          }
        } else {
          // Estado no esperado (rejected u otro)
          console.log('Usuario en estado no esperado:', profile.status);
          navigate('/pending-approval', { replace: true });
        }
      } catch (err) {
        console.error('Error en callback:', err);
        setError('Hubo un error al procesar tu autenticación. Por favor, intenta de nuevo.');
      }
    };

    handleCallback();
  }, [user, profile, loading, isAdmin, isTerapeuta, isApproved, isPending, navigate]);

  // Mostrar pantalla de carga
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        {error ? (
          <div className="card shadow-sm border-0 rounded-lg p-4" style={{ maxWidth: '500px' }}>
            <div className="card-body">
              <div className="mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  fill="currentColor"
                  className="bi bi-exclamation-triangle text-danger"
                  viewBox="0 0 16 16"
                >
                  <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
                  <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
                </svg>
              </div>
              <h5 className="mb-3">Error de Autenticación</h5>
              <p className="text-muted mb-4">{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login', { replace: true })}
              >
                Volver al Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h5 className="text-muted">Procesando autenticación...</h5>
            <p className="text-muted small">Por favor espera un momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

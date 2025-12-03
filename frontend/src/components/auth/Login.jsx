import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Login Component - Página de inicio de sesión con Google
 */
const Login = () => {
  const { signIn, loading } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signIn();
      // La redirección la maneja Supabase automáticamente
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Hubo un error al iniciar sesión. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body p-5">
                {/* Logo o título */}
                <div className="text-center mb-4">
                  <h1 className="h3 mb-3 fw-bold text-primary">RedPsicoFem</h1>
                  <p className="text-muted">
                    Red de derivación de pacientes para terapeutas
                  </p>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Botón de Google */}
                <div className="d-grid gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="btn btn-lg btn-outline-dark d-flex align-items-center justify-content-center"
                    style={{ gap: '12px' }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 18 18">
                          <path
                            fill="#4285F4"
                            d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
                          />
                          <path
                            fill="#34A853"
                            d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
                          />
                          <path
                            fill="#EA4335"
                            d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
                          />
                        </svg>
                        <span>Continuar con Google</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Información adicional */}
                <div className="mt-4 text-center">
                  <p className="small text-muted mb-0">
                    Al continuar, aceptas nuestros términos de servicio y política de
                    privacidad.
                  </p>
                </div>

                {/* Nota para usuarios nuevos */}
                <div className="alert alert-info mt-4 small" role="alert">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <strong>Primera vez:</strong> Si eres un usuario nuevo, tu cuenta
                  deberá ser aprobada por un administrador antes de poder acceder al
                  sistema.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-muted small">
                ¿Necesitas ayuda?{' '}
                <a href="mailto:soporte@redpsicofem.cl" className="text-primary">
                  Contacta con soporte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

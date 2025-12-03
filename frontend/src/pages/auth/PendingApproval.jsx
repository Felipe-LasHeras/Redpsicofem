import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PendingApproval - Página que se muestra cuando un usuario está esperando aprobación
 */
const PendingApproval = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body p-5 text-center">
                {/* Icono de reloj */}
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
                    fill="currentColor"
                    className="bi bi-clock-history text-warning"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z" />
                    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z" />
                    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z" />
                  </svg>
                </div>

                {/* Título */}
                <h1 className="h3 mb-3 fw-bold">Cuenta Pendiente de Aprobación</h1>

                {/* Mensaje principal */}
                <div className="alert alert-warning" role="alert">
                  <p className="mb-0">
                    Tu cuenta ha sido creada exitosamente y está esperando la aprobación
                    de un administrador.
                  </p>
                </div>

                {/* Información del usuario */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <p className="text-muted small mb-1">Información de tu cuenta:</p>
                    <p className="mb-1">
                      <strong>Email:</strong> {user?.email || profile?.email}
                    </p>
                    <p className="mb-0">
                      <strong>Nombre:</strong>{' '}
                      {profile?.display_name || user?.user_metadata?.full_name || 'No disponible'}
                    </p>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="text-start mb-4">
                  <h5 className="h6 mb-3">¿Qué sigue?</h5>
                  <ol className="small text-muted">
                    <li className="mb-2">
                      Un administrador revisará tu solicitud de acceso
                    </li>
                    <li className="mb-2">
                      Recibirás un correo electrónico cuando tu cuenta sea aprobada
                    </li>
                    <li className="mb-2">
                      Una vez aprobada, podrás acceder al sistema con tu cuenta de Google
                    </li>
                  </ol>
                </div>

                {/* Información de contacto */}
                <div className="alert alert-info small" role="alert">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Si tienes preguntas o crees que esto es un error, por favor contacta
                  con el administrador en{' '}
                  <a href="mailto:felipe.las.heras@gmail.com" className="alert-link">
                    felipe.las.heras@gmail.com
                  </a>
                </div>

                {/* Botones de acción */}
                <div className="d-grid gap-2 mt-4">
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline-secondary"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

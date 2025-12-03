import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { terapeutasApi } from '../../services/terapeutasApi';

/**
 * GestionUsuarios - Panel de administración para gestionar usuarios
 * Permite aprobar, rechazar y asignar roles a usuarios pendientes
 */
const GestionUsuarios = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTerapeuta, setSelectedTerapeuta] = useState('');

  // Cargar usuarios pendientes y terapeutas
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar usuarios pendientes
      const { users, error: usersError } = await authService.getPendingUsers();
      if (usersError) throw usersError;

      // Cargar lista de terapeutas
      const terapeutasData = await terapeutasApi.getAll();

      setPendingUsers(users || []);
      setTerapeutas(terapeutasData || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!selectedRole) {
      setError('Por favor, selecciona un rol para el usuario');
      return;
    }

    if (
      (selectedRole === 'terapeuta_red_derivacion' ||
        selectedRole === 'terapeuta_redpsicofem') &&
      !selectedTerapeuta
    ) {
      setError('Por favor, selecciona un terapeuta para asociar');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      const terapeutaId = selectedTerapeuta ? parseInt(selectedTerapeuta) : null;

      const { user, error: approveError } = await authService.approveUser(
        userId,
        selectedRole,
        terapeutaId
      );

      if (approveError) throw approveError;

      setSuccess('Usuario aprobado exitosamente');
      setSelectedUser(null);
      setSelectedRole('');
      setSelectedTerapeuta('');

      // Recargar datos
      await loadData();
    } catch (err) {
      console.error('Error al aprobar usuario:', err);
      setError('Error al aprobar el usuario. Por favor, intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar este usuario?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      const { error: rejectError } = await authService.rejectUser(userId);

      if (rejectError) throw rejectError;

      setSuccess('Usuario rechazado');

      // Recargar datos
      await loadData();
    } catch (err) {
      console.error('Error al rechazar usuario:', err);
      setError('Error al rechazar el usuario. Por favor, intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalModal = (user) => {
    setSelectedUser(user);
    setSelectedRole('');
    setSelectedTerapeuta('');
    setError(null);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setSelectedRole('');
    setSelectedTerapeuta('');
    setError(null);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando usuarios pendientes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="h4 mb-3">Gestión de Usuarios</h2>
          <p className="text-muted">
            Aprueba o rechaza las solicitudes de acceso de nuevos usuarios
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess(null)}
          ></button>
        </div>
      )}

      {/* Lista de usuarios pendientes */}
      {pendingUsers.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              fill="currentColor"
              className="bi bi-check-circle text-success mb-3"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
            </svg>
            <h5>No hay usuarios pendientes</h5>
            <p className="text-muted">
              Todos los usuarios han sido revisados. Cuando haya nuevas solicitudes aparecerán aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Fecha de Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{user.display_name || '-'}</td>
                      <td>
                        {new Date(user.created_at).toLocaleDateString('es-CL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => openApprovalModal(user)}
                          disabled={processing}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Aprobar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(user.id)}
                          disabled={processing}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de aprobación */}
      {selectedUser && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Aprobar Usuario</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={processing}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  <strong>Usuario:</strong> {selectedUser.email}
                </p>

                {/* Seleccionar rol */}
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Rol <span className="text-danger">*</span>
                  </label>
                  <select
                    id="role"
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={processing}
                  >
                    <option value="">Seleccionar rol...</option>
                    <option value="admin">Administrador</option>
                    <option value="terapeuta_red_derivacion">
                      Terapeuta Red de Derivación
                    </option>
                    <option value="terapeuta_redpsicofem">Terapeuta RedPsicoFem</option>
                  </select>
                </div>

                {/* Seleccionar terapeuta (solo si el rol es terapeuta) */}
                {(selectedRole === 'terapeuta_red_derivacion' ||
                  selectedRole === 'terapeuta_redpsicofem') && (
                  <div className="mb-3">
                    <label htmlFor="terapeuta" className="form-label">
                      Asociar con Terapeuta <span className="text-danger">*</span>
                    </label>
                    <select
                      id="terapeuta"
                      className="form-select"
                      value={selectedTerapeuta}
                      onChange={(e) => setSelectedTerapeuta(e.target.value)}
                      disabled={processing}
                    >
                      <option value="">Seleccionar terapeuta...</option>
                      {terapeutas.map((terapeuta) => (
                        <option key={terapeuta.id} value={terapeuta.id}>
                          {terapeuta.nombre} {terapeuta.apellido} - {terapeuta.especialidad}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Este usuario podrá editar los datos de este terapeuta
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedUser.id)}
                  disabled={processing || !selectedRole}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Aprobar Usuario
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;

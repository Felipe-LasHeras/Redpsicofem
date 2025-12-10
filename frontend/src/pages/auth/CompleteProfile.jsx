import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { terapeutasApi } from "../../services/terapeutasApi";
import { authService } from "../../services/authService";
import { regiones } from "../../components/common/RegionesyComunas";

/**
 * CompleteProfile - Formulario de completar perfil para nuevos usuarios
 * Se muestra después del registro con Google para capturar información de terapeuta
 */
const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [paso, setPaso] = useState(1);
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    mail: "",
    telefono: "",
    region: "",
    ciudad: "",
    rut: "",
    especialidad: "",
    tipo_terapeuta_nombre: "", // "Redpsicofem" o "Red derivacion"
  });

  // Pre-llenar datos del usuario de Google
  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || "";
      const nameParts = fullName.split(" ");

      setFormData((prev) => ({
        ...prev,
        nombre: nameParts[0] || "",
        apellido: nameParts.slice(1).join(" ") || "",
        mail: user.email || "",
      }));
    }
  }, [user]);

  // Redirigir si ya completó el perfil
  useEffect(() => {
    if (profile?.profile_completed) {
      navigate("/pending-approval", { replace: true });
    }
  }, [profile, navigate]);

  // Cargar comunas cuando cambia la región
  useEffect(() => {
    if (formData.region) {
      const regionSeleccionada = regiones.find(
        (region) => region.nombre === formData.region
      );
      if (regionSeleccionada) {
        setComunasDisponibles(regionSeleccionada.comunas);
      }
    }
  }, [formData.region]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Si cambia la región, resetear la comuna
    if (id === "region") {
      const regionSeleccionada = regiones.find(
        (region) => region.nombre === value
      );
      if (regionSeleccionada) {
        setComunasDisponibles(regionSeleccionada.comunas);
        setFormData((prev) => ({
          ...prev,
          ciudad: "",
        }));
      }
    }
  };

  const nextStep = () => {
    // Validación básica antes de avanzar
    if (paso === 1) {
      if (!formData.nombre || !formData.apellido || !formData.mail || !formData.rut) {
        setMensaje({
          tipo: "error",
          texto: "Por favor complete todos los campos obligatorios",
        });
        return;
      }
    } else if (paso === 2) {
      if (!formData.tipo_terapeuta_nombre) {
        setMensaje({
          tipo: "error",
          texto: "Por favor seleccione un tipo de terapeuta",
        });
        return;
      }
    }

    setMensaje({ tipo: "", texto: "" });
    setPaso(paso + 1);
  };

  const prevStep = () => {
    setPaso(paso - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      // Validar campos finales
      if (!formData.region || !formData.ciudad) {
        setMensaje({
          tipo: "error",
          texto: "Por favor complete todos los campos obligatorios",
        });
        setLoading(false);
        return;
      }

      // Determinar el rol basado en el tipo de terapeuta
      const role = formData.tipo_terapeuta_nombre === "Redpsicofem"
        ? "terapeuta_redpsicofem"
        : "terapeuta_red_derivacion";

      // 1. Crear el registro de terapeuta en la tabla psicologos
      const terapeutaData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        mail: formData.mail,
        telefono: formData.telefono || "",
        tipo_terapeuta: formData.tipo_terapeuta_nombre === "Redpsicofem",
        tipo_terapeuta_nombre: formData.tipo_terapeuta_nombre,
        especialidad: formData.especialidad || "Psicología general",
        region: formData.region,
        comuna: formData.ciudad,
        rut: formData.rut,
        auth_user_id: user.id,

        // Valores por defecto para campos requeridos
        lugar_atencion: "Por definir",
        valor_consulta: 0,
        descripcion: `Terapeuta de ${formData.tipo_terapeuta_nombre === "Redpsicofem" ? "RedPsicoFem" : "Red de Derivación"}`,
        edad_atencion: "",
        tipo_atencion: "Por definir",
        horarios: "",

        // Inicializar campos opcionales
        direccion_atencion: "",
        atiende_ninos: false,
        atiende_adolescentes: false,
        atiende_adultos: false,
        atiende_hombre_cis: false,
        atiende_presencial: false,
        atiende_online: false,
        arancel_diferencial: false,

        // Inicializar estructuras de horarios
        horarios_online: JSON.stringify({
          lunes: [],
          martes: [],
          miercoles: [],
          jueves: [],
          viernes: []
        }),
        horarios_presencial: JSON.stringify({
          lunes: [],
          martes: [],
          miercoles: [],
          jueves: [],
          viernes: []
        })
      };

      const terapeutaResponse = await terapeutasApi.create(terapeutaData);

      if (!terapeutaResponse.data || !terapeutaResponse.data.id) {
        throw new Error("No se pudo crear el registro de terapeuta");
      }

      // 2. Actualizar el perfil del usuario con el ID del terapeuta y marcarlo como completado
      const profileUpdateResult = await authService.upsertUserProfile(user.id, {
        terapeuta_id: terapeutaResponse.data.id,
        role: role,
        profile_completed: true,
        display_name: `${formData.nombre} ${formData.apellido}`,
      });

      if (profileUpdateResult.error) {
        throw new Error("Error al actualizar el perfil de usuario");
      }

      // 3. Refrescar el perfil para obtener los datos actualizados
      await refreshProfile();

      setMensaje({
        tipo: "success",
        texto: "¡Perfil completado exitosamente! Tu solicitud está pendiente de aprobación.",
      });

      // Redirigir a la página de pending approval después de un breve delay
      setTimeout(() => {
        navigate("/pending-approval", { replace: true });
      }, 2000);

    } catch (error) {
      console.error("Error al completar perfil:", error);
      setMensaje({
        tipo: "error",
        texto: `Error: ${error.message || "Hubo un error al completar el perfil"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizado de formulario básico (paso 1)
  const renderFormularioBase = () => {
    return (
      <div>
        <h4 className="mb-4">Completa tu Información Básica</h4>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="apellido" className="form-label">
                Apellido <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="mail" className="form-label">
                Correo Electrónico <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                id="mail"
                value={formData.mail}
                onChange={handleChange}
                required
                disabled
              />
              <small className="text-muted">Este email proviene de tu cuenta de Google</small>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                className="form-control"
                id="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 XXXX XXXX"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="rut" className="form-label">
                RUT <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="rut"
                value={formData.rut}
                onChange={handleChange}
                required
                placeholder="12.345.678-9"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="especialidad" className="form-label">
                Especialidad
              </label>
              <input
                type="text"
                className="form-control"
                id="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                placeholder="Ej: Psicología Clínica, Terapia Familiar, etc."
              />
            </div>
          </div>
        </div>

        <div className="d-grid mt-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextStep}
            disabled={loading}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  // Renderizado de selección de tipo (paso 2)
  const renderSeleccionTipo = () => {
    return (
      <div>
        <h4 className="mb-4">Selecciona el tipo de terapeuta</h4>

        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Esta selección determinará a qué recursos y herramientas tendrás acceso en la plataforma.
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div
              className={`card h-100 ${formData.tipo_terapeuta_nombre === "Redpsicofem" ? "border-primary border-3" : "border"}`}
              style={{ cursor: "pointer" }}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  tipo_terapeuta_nombre: "Redpsicofem",
                }))
              }
            >
              <div className="card-body p-4">
                <h5 className="card-title text-primary">
                  <i className="bi bi-hospital me-2"></i>
                  Redpsicofem
                </h5>
                <p className="card-text">
                  Terapeuta del equipo clínico de REDPSICOFEM. Tendrás acceso a todas las
                  herramientas y recursos del centro para gestionar tus pacientes.
                </p>
                <ul className="list-unstyled mt-3">
                  <li><i className="bi bi-check-circle text-success me-2"></i>Gestión completa de pacientes</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Acceso a recursos del centro</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Herramientas administrativas</li>
                </ul>
                {formData.tipo_terapeuta_nombre === "Redpsicofem" && (
                  <div className="mt-3">
                    <span className="badge bg-primary">✓ Seleccionado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div
              className={`card h-100 ${formData.tipo_terapeuta_nombre === "Red derivacion" ? "border-primary border-3" : "border"}`}
              style={{ cursor: "pointer" }}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  tipo_terapeuta_nombre: "Red derivacion",
                }))
              }
            >
              <div className="card-body p-4">
                <h5 className="card-title text-primary">
                  <i className="bi bi-diagram-3 me-2"></i>
                  Red de Derivación
                </h5>
                <p className="card-text">
                  Terapeuta externo que forma parte de la red de derivación. Recibirás
                  derivaciones de pacientes según tu disponibilidad y especialidad.
                </p>
                <ul className="list-unstyled mt-3">
                  <li><i className="bi bi-check-circle text-success me-2"></i>Recepción de derivaciones</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Gestión de disponibilidad</li>
                  <li><i className="bi bi-check-circle text-success me-2"></i>Red colaborativa</li>
                </ul>
                {formData.tipo_terapeuta_nombre === "Red derivacion" && (
                  <div className="mt-3">
                    <span className="badge bg-primary">✓ Seleccionado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={prevStep}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Atrás
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextStep}
            disabled={!formData.tipo_terapeuta_nombre || loading}
          >
            Siguiente
            <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    );
  };

  // Renderizado de ubicación (paso 3)
  const renderUbicacion = () => {
    return (
      <div>
        <h4 className="mb-4">Ubicación</h4>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="region" className="form-label">
                Región <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="region"
                value={formData.region}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una región</option>
                {regiones.map((region) => (
                  <option key={region.id} value={region.nombre}>
                    {region.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="ciudad" className="form-label">
                Comuna <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                required
                disabled={!formData.region}
              >
                <option value="">Seleccione una comuna</option>
                {comunasDisponibles.map((comuna) => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12">
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>
              <strong>¡Casi listo!</strong> Después de completar este registro, un administrador
              revisará tu solicitud y te notificará cuando tu cuenta esté aprobada.
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={prevStep}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Atrás
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading || !formData.region || !formData.ciudad}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Completar Registro
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Renderizado de paso actual
  const renderCurrentStep = () => {
    switch (paso) {
      case 1:
        return renderFormularioBase();
      case 2:
        return renderSeleccionTipo();
      case 3:
        return renderUbicacion();
      default:
        return null;
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white py-3">
                <h3 className="mb-0">
                  <i className="bi bi-person-plus me-2"></i>
                  Completa tu Registro
                </h3>
              </div>

              <div className="card-body p-4">
                {mensaje.texto && (
                  <div
                    className={`alert alert-${
                      mensaje.tipo === "success" ? "success" : "danger"
                    } mb-4`}
                  >
                    {mensaje.texto}
                  </div>
                )}

                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${(paso / 3) * 100}%` }}
                      aria-valuenow={paso}
                      aria-valuemin="0"
                      aria-valuemax="3"
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span className={paso >= 1 ? "text-primary fw-bold small" : "text-muted small"}>
                      <i className="bi bi-1-circle me-1"></i>
                      Datos Básicos
                    </span>
                    <span className={paso >= 2 ? "text-primary fw-bold small" : "text-muted small"}>
                      <i className="bi bi-2-circle me-1"></i>
                      Tipo de Terapeuta
                    </span>
                    <span className={paso >= 3 ? "text-primary fw-bold small" : "text-muted small"}>
                      <i className="bi bi-3-circle me-1"></i>
                      Ubicación
                    </span>
                  </div>
                </div>

                {renderCurrentStep()}
              </div>
            </div>

            {/* Nota de ayuda */}
            <div className="text-center mt-3">
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

export default CompleteProfile;

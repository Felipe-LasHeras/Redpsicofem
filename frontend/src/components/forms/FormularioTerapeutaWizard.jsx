import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { terapeutasApi } from "../../services/terapeutasApi";
import { regiones } from "../common/RegionesyComunas";

const FormularioTerapeutaWizard = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos base (paso 1)
    nombre: "",
    apellido: "",
    mail: "",
    telefono: "",
    region: "",
    ciudad: "",
    rut: "",
    edad: "",
    especialidad: "",
    
    // Tipo de terapeuta (paso 2)
    tipo_terapeuta_nombre: "",
    
    // Campos compartidos (paso 3)
    direccion_atencion: "",
    atiende_ninos: false,
    atiende_adolescentes: false,
    atiende_adultos: false,
    atiende_hombre_cis: false,
    atiende_presencial: false,
    atiende_online: false,
    arancel_diferencial: false,
    
    // Campos específicos Red derivación
    valor_general_atencion: "",
    cupos_30000_35000: 0,
    cupos_25000_29000: 0,
    cupos_20000_24000: 0,
    cupos_15000_19000: 0,
    
    // Campos específicos Redpsicofem
    perfil_reservo: "",
  });
  
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
  
  // Opciones de horarios
  const opcionesHorarios = [
    { label: "09:00 - 10:00", value: "09:00-10:00" },
    { label: "10:00 - 11:00", value: "10:00-11:00" },
    { label: "11:00 - 12:00", value: "11:00-12:00" },
    { label: "12:00 - 13:00", value: "12:00-13:00" },
    { label: "15:00 - 16:00", value: "15:00-16:00" },
    { label: "16:00 - 17:00", value: "16:00-17:00" },
  ];
  
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [id]: checked,
      }));
    } else {
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
      // Recopilar horarios seleccionados
      const horariosSeleccionados = Object.entries(formData)
        .filter(([key, value]) => key.startsWith("horario_") && value)
        .map(([key]) => key.replace("horario_", ""));
      
      // Preparar datos para guardar
      const terapeutaData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipo_terapeuta: formData.tipo_terapeuta_nombre === "Redpsicofem",
        tipo_terapeuta_nombre: formData.tipo_terapeuta_nombre,
        especialidad: formData.especialidad || "Psicología general",
        region: formData.region,
        comuna: formData.ciudad,
        lugar_atencion: formData.direccion_atencion,
        valor_consulta: formData.tipo_terapeuta_nombre === "Red derivacion" ? 
                         parseInt(formData.valor_general_atencion) || 0 : 0,
        descripcion: "Profesional de " + 
                     (formData.tipo_terapeuta_nombre === "Redpsicofem" ? "RedPsicoFem" : "Red de Derivación"),
        rut: formData.rut,
        edad_atencion: [
          formData.atiende_ninos ? "Niños" : "",
          formData.atiende_adolescentes ? "Adolescentes" : "",
          formData.atiende_adultos ? "Adultos" : ""
        ].filter(Boolean).join(", "),
        tipo_atencion: formData.atiende_presencial && formData.atiende_online ? "Ambos" :
                       formData.atiende_presencial ? "Presencial" : "Online",
        horarios: horariosSeleccionados.join(", "),
        
        // Campos específicos
        direccion_atencion: formData.direccion_atencion,
        atiende_ninos: formData.atiende_ninos,
        atiende_adolescentes: formData.atiende_adolescentes,
        atiende_adultos: formData.atiende_adultos,
        atiende_hombre_cis: formData.atiende_hombre_cis,
        atiende_presencial: formData.atiende_presencial,
        atiende_online: formData.atiende_online,
        arancel_diferencial: formData.arancel_diferencial,
        
        // Campos Red derivación
        valor_general_atencion: formData.tipo_terapeuta_nombre === "Red derivacion" ? 
                               parseInt(formData.valor_general_atencion) || 0 : null,
        cupos_30000_35000: formData.tipo_terapeuta_nombre === "Red derivacion" ? 
                          parseInt(formData.cupos_30000_35000) || 0 : null,
        cupos_25000_29000: formData.tipo_terapeuta_nombre === "Red derivacion" ? 
                          parseInt(formData.cupos_25000_29000) || 0 : null,
        cupos_20000_24000: formData.tipo_terapeuta_nombre === "Red derivacion" ? 
                          parseInt(formData.cupos_20000_24000) || 0 : null,
        cupos_15000_19000: formData.tipo_terapeuta_nombre === "Red derivacion" ? 
                          parseInt(formData.cupos_15000_19000) || 0 : null,
        
        // Campos Redpsicofem
        perfil_reservo: formData.tipo_terapeuta_nombre === "Redpsicofem" ? 
                       formData.perfil_reservo : null
      };
      
      const response = await terapeutasApi.create(terapeutaData);
      
      if (response.success) {
        setMensaje({
          tipo: "success",
          texto: "¡Terapeuta registrado exitosamente!",
        });
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      } else {
        throw new Error("No se pudo registrar el terapeuta");
      }
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: `Error: ${error.message || "Hubo un error al guardar los datos"}`,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizado de formulario base (paso 1)
  const renderFormularioBase = () => {
    return (
      <div>
        <h4 className="mb-4">Información Básica del Terapeuta</h4>
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
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Teléfono <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className="form-control"
                id="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
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
              <label htmlFor="edad" className="form-label">
                Edad
              </label>
              <input
                type="number"
                className="form-control"
                id="edad"
                value={formData.edad}
                onChange={handleChange}
              />
            </div>
          </div>
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
        
        <div className="row g-4">
          <div className="col-md-6">
            <div 
              className={`card h-100 ${formData.tipo_terapeuta_nombre === "Redpsicofem" ? "border-primary" : "border"}`}
              style={{ cursor: "pointer" }}
              onClick={() => 
                setFormData((prev) => ({
                  ...prev,
                  tipo_terapeuta_nombre: "Redpsicofem",
                }))
              }
            >
              <div className="card-body p-4">
                <h5 className="card-title">Redpsicofem</h5>
                <p className="card-text">
                  Terapeuta del equipo clínico de REDPSICOFEM. Tendrá acceso a todas las 
                  herramientas y recursos del centro.
                </p>
                {formData.tipo_terapeuta_nombre === "Redpsicofem" && (
                  <div className="mt-3">
                    <span className="badge bg-primary">Seleccionado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div 
              className={`card h-100 ${formData.tipo_terapeuta_nombre === "Red derivacion" ? "border-primary" : "border"}`}
              style={{ cursor: "pointer" }}
              onClick={() => 
                setFormData((prev) => ({
                  ...prev,
                  tipo_terapeuta_nombre: "Red derivacion",
                }))
              }
            >
              <div className="card-body p-4">
                <h5 className="card-title">Red de Derivación</h5>
                <p className="card-text">
                  Terapeuta externo que forma parte de la red de derivación. Recibirá 
                  derivaciones de pacientes según disponibilidad y especialidad.
                </p>
                {formData.tipo_terapeuta_nombre === "Red derivacion" && (
                  <div className="mt-3">
                    <span className="badge bg-primary">Seleccionado</span>
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
          >
            Atrás
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextStep}
            disabled={!formData.tipo_terapeuta_nombre}
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };
  
  // Renderizado de formulario Redpsicofem (paso 3)
  const renderFormularioRedpsicofem = () => {
    return (
      <div>
        <h4 className="mb-4">Información específica de Redpsicofem</h4>
        
        <div className="row g-3">
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="direccion_atencion" className="form-label">
                Dirección de atención <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="direccion_atencion"
                value={formData.direccion_atencion}
                onChange={handleChange}
                required
                placeholder="Dirección física o 'Online'"
              />
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label d-block">
              A quién atiende <span className="text-danger">*</span>
            </label>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_ninos"
                checked={formData.atiende_ninos}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_ninos">
                Niños
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_adolescentes"
                checked={formData.atiende_adolescentes}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_adolescentes">
                Adolescentes
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_adultos"
                checked={formData.atiende_adultos}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_adultos">
                Adultos
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_hombre_cis"
                checked={formData.atiende_hombre_cis}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_hombre_cis">
                Atiende a hombres cis
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label d-block">
              Modalidad de atención <span className="text-danger">*</span>
            </label>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_presencial"
                checked={formData.atiende_presencial}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_presencial">
                Presencial
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_online"
                checked={formData.atiende_online}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_online">
                Online
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="arancel_diferencial"
                checked={formData.arancel_diferencial}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="arancel_diferencial">
                Ofrece arancel diferencial
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="perfil_reservo" className="form-label">
                Perfil Reservo
              </label>
              <input
                type="text"
                className="form-control"
                id="perfil_reservo"
                value={formData.perfil_reservo}
                onChange={handleChange}
                placeholder="URL de tu perfil en Reservo (opcional)"
              />
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label mb-3">
              Horarios disponibles <span className="text-danger">*</span>
            </label>
            <div className="row g-2">
              {opcionesHorarios.map((horario) => (
                <div className="col-md-6 col-lg-4" key={horario.value}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`horario_${horario.value}`}
                      checked={formData[`horario_${horario.value}`] || false}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor={`horario_${horario.value}`}>
                      {horario.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={prevStep}
          >
            Atrás
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              "Guardar Terapeuta"
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // Renderizado de formulario Red de Derivación (paso 3)
  const renderFormularioRedDerivacion = () => {
    return (
      <div>
        <h4 className="mb-4">Información específica de Red de Derivación</h4>
        
        <div className="row g-3">
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="direccion_atencion" className="form-label">
                Dirección de atención <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="direccion_atencion"
                value={formData.direccion_atencion}
                onChange={handleChange}
                required
                placeholder="Dirección física o 'Online'"
              />
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label d-block">
              A quién atiende <span className="text-danger">*</span>
            </label>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_ninos"
                checked={formData.atiende_ninos}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_ninos">
                Niños
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_adolescentes"
                checked={formData.atiende_adolescentes}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_adolescentes">
                Adolescentes
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_adultos"
                checked={formData.atiende_adultos}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_adultos">
                Adultos
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_hombre_cis"
                checked={formData.atiende_hombre_cis}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_hombre_cis">
                Atiende a hombres cis
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label d-block">
              Modalidad de atención <span className="text-danger">*</span>
            </label>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_presencial"
                checked={formData.atiende_presencial}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_presencial">
                Presencial
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                type="checkbox"
                className="form-check-input"
                id="atiende_online"
                checked={formData.atiende_online}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="atiende_online">
                Online
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="arancel_diferencial"
                checked={formData.arancel_diferencial}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="arancel_diferencial">
                Ofrece arancel diferencial
              </label>
            </div>
          </div>
          
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="valor_general_atencion" className="form-label">
                Valor general de atención (CLP) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="valor_general_atencion"
                value={formData.valor_general_atencion}
                onChange={handleChange}
                required
                placeholder="Ej: 35000"
                min="0"
              />
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="cupos_30000_35000" className="form-label">
                Cupos disponibles $30.000 a $35.000
              </label>
              <input
                type="number"
                className="form-control"
                id="cupos_30000_35000"
                value={formData.cupos_30000_35000}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="cupos_25000_29000" className="form-label">
                Cupos disponibles $25.000 a $29.000
              </label>
              <input
                type="number"
                className="form-control"
                id="cupos_25000_29000"
                value={formData.cupos_25000_29000}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="cupos_20000_24000" className="form-label">
                Cupos disponibles $20.000 a $24.000
              </label>
              <input
                type="number"
                className="form-control"
                id="cupos_20000_24000"
                value={formData.cupos_20000_24000}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="cupos_15000_19000" className="form-label">
                Cupos disponibles $15.000 a $19.000
              </label>
              <input
                type="number"
                className="form-control"
                id="cupos_15000_19000"
                value={formData.cupos_15000_19000}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          
          <div className="col-12">
            <label className="form-label mb-3">
              Horarios disponibles <span className="text-danger">*</span>
            </label>
            <div className="row g-2">
              {opcionesHorarios.map((horario) => (
                <div className="col-md-6 col-lg-4" key={horario.value}>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`horario_${horario.value}`}
                      checked={formData[`horario_${horario.value}`] || false}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor={`horario_${horario.value}`}>
                      {horario.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={prevStep}
          >
            Atrás
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              "Guardar Terapeuta"
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
        return formData.tipo_terapeuta_nombre === "Redpsicofem"
          ? renderFormularioRedpsicofem()
          : renderFormularioRedDerivacion();
      default:
        return null;
    }
  };
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Registro de Terapeuta</h3>
            </div>
            
            <div className="card-body">
              {mensaje.texto && (
                <div
                  className={`alert alert-${
                    mensaje.tipo === "success" ? "success" : "danger"
                  } mb-4`}
                >
                  {mensaje.texto}
                </div>
              )}
              
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
                <div className="d-flex justify-content-between mt-1">
                  <span className={paso >= 1 ? "text-primary fw-bold" : "text-muted"}>
                    Datos Básicos
                  </span>
                  <span className={paso >= 2 ? "text-primary fw-bold" : "text-muted"}>
                    Tipo de Terapeuta
                  </span>
                  <span className={paso >= 3 ? "text-primary fw-bold" : "text-muted"}>
                    Datos Específicos
                  </span>
                </div>
              </div>
              
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioTerapeutaWizard;
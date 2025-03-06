import React, { useState, useEffect } from "react";
import { camposApi } from "../../services/camposApi";

const GestionCampos = () => {
  const [campos, setCampos] = useState([]);
  const [editingCampo, setEditingCampo] = useState(null);
  const [formData, setFormData] = useState({
    nombre_campo: "",
    etiqueta: "",
    tipo: "text",
    requerido: false,
    activo: true,
    orden: 0,
    categoria: "general",
    opciones: []
  });
  const [opcionNueva, setOpcionNueva] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    cargarCampos();
  }, []);

  const cargarCampos = async () => {
    try {
      const data = await camposApi.getAll();
      setCampos(data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al cargar campos" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAgregarOpcion = () => {
    if (!opcionNueva.trim()) return;
    
    const nuevaOpcion = {
      label: opcionNueva,
      value: opcionNueva.toLowerCase().replace(/\s+/g, '_')
    };
    
    setFormData((prevData) => ({
      ...prevData,
      opciones: [...prevData.opciones, nuevaOpcion]
    }));
    
    setOpcionNueva("");
  };

  const handleRemoveOpcion = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      opciones: prevData.opciones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const campoData = {
        ...formData,
        opciones: formData.tipo === "dropdown" || formData.tipo === "checkbox-group" 
          ? formData.opciones 
          : null
      };

      let resultado;
if (editingCampo) {
  resultado = await camposApi.update(editingCampo.id, campoData);
  setMensaje({ tipo: "success", texto: `Campo '${resultado.etiqueta}' actualizado exitosamente` });
} else {
  resultado = await camposApi.create(campoData);
  setMensaje({ tipo: "success", texto: `Campo '${resultado.etiqueta}' creado exitosamente` });
}

      resetForm();
      cargarCampos();
    } catch (error) {
      setMensaje({ 
        tipo: "error", 
        texto: `Error: ${error.message || "No se pudo guardar el campo"}` 
      });
    }
  };

  const handleEdit = (campo) => {
    setEditingCampo(campo);
    setFormData({
      nombre_campo: campo.nombre_campo,
      etiqueta: campo.etiqueta,
      tipo: campo.tipo,
      requerido: campo.requerido,
      activo: campo.activo,
      orden: campo.orden,
      categoria: campo.categoria,
      opciones: campo.opciones || []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este campo?")) return;

    try {
      await camposApi.delete(id);
      setMensaje({ tipo: "success", texto: "Campo eliminado exitosamente" });
      cargarCampos();
    } catch (error) {
      setMensaje({ 
        tipo: "error", 
        texto: `Error: ${error.message || "No se pudo eliminar el campo"}` 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_campo: "",
      etiqueta: "",
      tipo: "text",
      requerido: false,
      activo: true,
      orden: campos.length,
      categoria: "general",
      opciones: []
    });
    setEditingCampo(null);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Gestión de Campos Dinámicos</h2>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo === "success" ? "success" : "danger"} mb-4`}>
          {mensaje.texto}
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editingCampo ? "Editar Campo" : "Nuevo Campo"}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre_campo" className="form-label">
                    Nombre Interno <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre_campo"
                    name="nombre_campo"
                    value={formData.nombre_campo}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="text-muted">
  Este nombre se usará como identificador técnico en la base de datos. 
  Ejemplo: Si el campo es "Teléfono Alternativo", un buen nombre interno sería "telefono_alternativo" (sin espacios ni caracteres especiales).
</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="etiqueta" className="form-label">
                    Etiqueta <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="etiqueta"
                    name="etiqueta"
                    value={formData.etiqueta}
                    onChange={handleInputChange}
                    required
                  />
                  <small className="text-muted">Esta etiqueta se mostrará en el formulario</small>
                </div>

                <div className="mb-3">
                  <label htmlFor="tipo" className="form-label">Tipo de Campo</label>
                  <select
                    className="form-select"
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="textarea">Área de Texto</option>
                    <option value="dropdown">Lista Desplegable</option>
                    <option value="checkbox-group">Grupo de Casillas</option>
                    <option value="date">Fecha</option>
                  </select>
                </div>

                {(formData.tipo === "dropdown" || formData.tipo === "checkbox-group") && (
                  <div className="mb-3">
                    <label className="form-label">Opciones</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={opcionNueva}
                        onChange={(e) => setOpcionNueva(e.target.value)}
                        placeholder="Nueva opción"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleAgregarOpcion}
                      >
                        Agregar
                      </button>
                    </div>

                    <ul className="list-group">
                      {formData.opciones.map((opcion, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          {opcion.label}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveOpcion(index)}
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="categoria" className="form-label">Categoría</label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="orden" className="form-label">Orden</label>
                  <input
                    type="number"
                    className="form-control"
                    id="orden"
                    name="orden"
                    value={formData.orden}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="requerido"
                    name="requerido"
                    checked={formData.requerido}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="requerido">Campo Requerido</label>
                </div>

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="activo"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="activo">Campo Activo</label>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingCampo ? "Actualizar" : "Guardar"}
                  </button>
                  {editingCampo && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Campos Configurados</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Etiqueta</th>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Categoría</th>
                      <th>Requerido</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campos.map((campo) => (
                      <tr key={campo.id} className={!campo.activo ? "table-secondary" : ""}>
                        <td>{campo.orden}</td>
                        <td>{campo.etiqueta}</td>
                        <td>{campo.nombre_campo}</td>
                        <td>{campo.tipo}</td>
                        <td>{campo.categoria}</td>
                        <td>
                          {campo.requerido ? (
                            <span className="badge bg-success">Sí</span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>
                        <td>
                          {campo.activo ? (
                            <span className="badge bg-success">Activo</span>
                          ) : (
                            <span className="badge bg-danger">Inactivo</span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(campo)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(campo.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {campos.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-3">
                          No hay campos configurados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionCampos;
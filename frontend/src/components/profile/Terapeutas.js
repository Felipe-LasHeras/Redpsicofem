import React, { useState } from 'react';

function ProfileForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    especialidad: '',
    region: '',
    comuna: '',
    lugarAtencion: '',
    valorConsulta: '',
    descripcionPersonal: '',
    perfilReservo: '',
    tipoTerapeuta: 'interno',
    fotoPerfil: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        fotoPerfil: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // Aquí iría la lógica para enviar los datos
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Perfil del Terapeuta</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Foto de perfil */}
                <div className="row mb-4">
                  <div className="col-12 text-center">
                    <div className="position-relative d-inline-block">
                      <div 
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                        style={{
                          width: '150px',
                          height: '150px',
                          border: '2px dashed #ccc'
                        }}
                      >
                        {formData.fotoPerfil ? (
                          <img
                            src={URL.createObjectURL(formData.fotoPerfil)}
                            alt="Foto de perfil"
                            className="rounded-circle"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <i className="bi bi-person-fill" style={{ fontSize: '4rem' }}></i>
                        )}
                      </div>
                      <div className="mt-2">
                        <input
                          type="file"
                          id="fotoPerfil"
                          name="fotoPerfil"
                          accept="image/*"
                          className="form-control"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información personal */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        name="nombre"
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="nombre">Nombre</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="apellido"
                        name="apellido"
                        placeholder="Apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="apellido">Apellido</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="especialidad"
                        name="especialidad"
                        placeholder="Especialidad"
                        value={formData.especialidad}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="especialidad">Especialidad</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <select
                        className="form-select"
                        id="tipoTerapeuta"
                        name="tipoTerapeuta"
                        value={formData.tipoTerapeuta}
                        onChange={handleInputChange}
                      >
                        <option value="interno">Interno</option>
                        <option value="externo">Externo</option>
                      </select>
                      <label htmlFor="tipoTerapeuta">Tipo de Terapeuta</label>
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="region"
                        name="region"
                        placeholder="Región"
                        value={formData.region}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="region">Región</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="comuna"
                        name="comuna"
                        placeholder="Comuna"
                        value={formData.comuna}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="comuna">Comuna</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="lugarAtencion"
                        name="lugarAtencion"
                        placeholder="Lugar de Atención"
                        value={formData.lugarAtencion}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="lugarAtencion">Lugar de Atención</label>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="number"
                        className="form-control"
                        id="valorConsulta"
                        name="valorConsulta"
                        placeholder="Valor Consulta"
                        value={formData.valorConsulta}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="valorConsulta">Valor Consulta</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="perfilReservo"
                        name="perfilReservo"
                        placeholder="Perfil de Reservo"
                        value={formData.perfilReservo}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="perfilReservo">Perfil de Reservo</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        id="descripcionPersonal"
                        name="descripcionPersonal"
                        placeholder="Descripción Personal"
                        style={{ height: '100px' }}
                        value={formData.descripcionPersonal}
                        onChange={handleInputChange}
                      ></textarea>
                      <label htmlFor="descripcionPersonal">Descripción Personal</label>
                    </div>
                  </div>
                </div>

                {/* Botón de envío */}
                <div className="row mt-4">
                  <div className="col">
                    <button type="submit" className="btn btn-primary w-100">
                      Guardar Perfil
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
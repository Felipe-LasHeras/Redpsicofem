import React from "react";
import imagenTerapia from "../assets/images/terapia-ilustracion.jpeg";

const Agradecimiento = () => {
  // Función para redirigir al sitio principal
  const irASitioPrincipal = () => {
    window.location.href = "https://www.redpsicofem.com/";
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-4"
      style={{
        backgroundImage: `url(${imagenTerapia})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Capa semitransparente para mejorar legibilidad del texto */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.85)', // Fondo blanco semitransparente
          zIndex: 1
        }}
      ></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <h1 className="display-4 mb-3">Muchas gracias</h1>
            <p className="lead mb-5">
              Hemos recibido tu información correctamente. Un miembro de nuestro
              equipo te contactará pronto.
            </p>

            <div className="d-grid gap-3">
              <button
                onClick={irASitioPrincipal}
                className="btn btn-primary btn-lg"
              >
                Volver a la página principal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agradecimiento;
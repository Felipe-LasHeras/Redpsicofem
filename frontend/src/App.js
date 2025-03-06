import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Formulario from './components/forms/ConstructorFormulario';
import Dashboard from './pages/admin/Dashboard';
import Terapeutas from './components/profile/Terapeutas';
import FormularioTerapeuta from './components/forms/FormularioTeraputa';
import FormularioTerapeutaWizard from './components/forms/FormularioTerapeutaWizard';
import GestionCampos from './components/admin/GestionCampos';
import Agradecimiento from './pages/Agradecimiento';
import PerfilTerapeuta from './components/profile/PerfilTerapeuta';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Ruta para la página principal */}
          <Route path="/" element={
            <header className="App-header">
              <Formulario />
            </header>
          } />
          
          {/* Ruta para el dashboard */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/formularioterapeuta" element={<FormularioTerapeuta />} />
          <Route path="/registro-terapeuta" element={<FormularioTerapeutaWizard />} />
          <Route path="/admin/campos" element={<GestionCampos />} />
          <Route path="/gracias" element={<Agradecimiento />} />
          <Route path="/terapeutas" element={<Terapeutas/>}/>
          <Route path="/terapeuta/:id" element={<PerfilTerapeuta />} />
          <Route path="/terapeuta/perfil" element={<PerfilTerapeuta />} />
          
          {/* Puedes agregar más rutas aquí */}
          {/* <Route path="/otra-pagina" element={<OtraPagina />} /> */}
          
          {/* Ruta para manejar páginas no encontradas */}
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
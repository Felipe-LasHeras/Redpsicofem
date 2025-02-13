import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Formulario from './components/forms/ConstructorFormulario';


// Importa tus otros componentes/páginas
import Dashboard from './pages/admin/Dashboard'; // Asumiendo que tienes este componente
import Terapeutas from './components/profile/Terapeutas'
// import OtrasPages from './components/OtrasPages';

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
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Puedes agregar más rutas aquí */}
          {/* <Route path="/otra-pagina" element={<OtraPagina />} /> */}
          
          {/* Ruta para manejar páginas no encontradas */}
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
          <Route path="/terapeutas"  element={<Terapeutas/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
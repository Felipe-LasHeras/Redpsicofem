import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';
import PendingApproval from './pages/auth/PendingApproval';
import CompleteProfile from './pages/auth/CompleteProfile';
import Formulario from './components/forms/ConstructorFormulario';
import Dashboard from './pages/admin/Dashboard';
import Terapeutas from './components/profile/Terapeutas';
import FormularioTerapeuta from './components/forms/FormularioTeraputa';
import FormularioTerapeutaWizard from './components/forms/FormularioTerapeutaWizard';
import GestionCampos from './components/admin/GestionCampos';
import GestionUsuarios from './components/admin/GestionUsuarios';
import Agradecimiento from './pages/Agradecimiento';
import PerfilTerapeuta from './components/profile/PerfilTerapeuta';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/complete-profile" element={<CompleteProfile />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Ruta para la página principal - pública */}
            <Route path="/" element={
              <header className="App-header">
                <Formulario />
              </header>
            } />

            {/* Rutas públicas de visualización */}
            <Route path="/terapeutas" element={<Terapeutas/>}/>
            <Route path="/terapeuta/:id" element={<PerfilTerapeuta />} />
            <Route path="/gracias" element={<Agradecimiento />} />

            {/* Rutas protegidas - Solo Admin */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute requireAdmin>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/campos" element={
              <PrivateRoute requireAdmin>
                <GestionCampos />
              </PrivateRoute>
            } />
            <Route path="/admin/usuarios" element={
              <PrivateRoute requireAdmin>
                <GestionUsuarios />
              </PrivateRoute>
            } />

            {/* Rutas protegidas - Solo Terapeutas */}
            <Route path="/terapeuta/perfil" element={
              <PrivateRoute requireTerapeuta>
                <PerfilTerapeuta />
              </PrivateRoute>
            } />

            {/* Rutas de formularios - Podrían necesitar autenticación según tu lógica */}
            <Route path="/formularioterapeuta" element={<FormularioTerapeuta />} />
            <Route path="/registro-terapeuta" element={<FormularioTerapeutaWizard />} />

            {/* Ruta para manejar páginas no encontradas */}
            <Route path="*" element={<div>404 - Página no encontrada</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
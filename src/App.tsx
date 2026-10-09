import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Alunos from './pages/Alunos';
import Chamada from './pages/Chamada';
import Calendario from './pages/Calendario';
import Perfil from './pages/Perfil';
import Secretarios from './pages/Secretarios';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/chamada" element={<Chamada />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/alunos" element={<Alunos />} />
              <Route path="/perfil" element={<Perfil />} />

              <Route element={<ProtectedRoute apenasAdmin />}>
                <Route path="/secretarios" element={<Secretarios />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

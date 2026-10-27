import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Alunos from './pages/Alunos';
import Chamada from './pages/Chamada';
import Calendario from './pages/Calendario';
import Relatorios from './pages/Relatorios';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/chamada" element={<Chamada />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

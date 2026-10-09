import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/', label: 'Painel', icon: 'bi-speedometer2', exact: true },
  { to: '/calendario', label: 'Calendário', icon: 'bi-calendar3' },
  { to: '/chamada', label: 'Chamada', icon: 'bi-clipboard-check' },
  { to: '/classes', label: 'Classes', icon: 'bi-diagram-3' },
  { to: '/alunos', label: 'Alunos', icon: 'bi-people' },
  { to: '/perfil', label: 'Meu Perfil', icon: 'bi-person-circle' },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <div className="sidebar-admig d-flex flex-column p-3" style={{ width: 250 }}>
      <div className="text-center mb-4 mt-2">
        <img src="/admig-mark.svg" alt="ADMIG AD" className="sidebar-logo" />
        <div className="small text-white-50 mt-2">Escola Dominical</div>
      </div>
      <nav className="nav nav-pills flex-column gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.exact}
            className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${l.icon}`} />
            {l.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/secretarios"
            className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
          >
            <i className="bi bi-shield-lock" />
            Secretários
          </NavLink>
        )}
      </nav>
    </div>
  );
}

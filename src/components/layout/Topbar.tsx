import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { usuario, logout } = useAuth();

  return (
    <div className="d-flex align-items-center justify-content-between bg-white border-bottom px-3 py-2 sticky-top">
      <button className="btn d-lg-none" onClick={onToggleSidebar} aria-label="Abrir menu">
        <i className="bi bi-list fs-3 text-brand-primary" />
      </button>
      <div className="d-none d-lg-block" />
      <div className="d-flex align-items-center gap-2">
        <span className={`badge ${usuario?.role === 'ADMINISTRADOR' ? 'bg-brand-navy' : 'bg-brand-primary'}`}>
          {usuario?.role === 'ADMINISTRADOR' ? 'Administrador' : 'Secretário'}
        </span>
        <img
          src={usuario?.fotoUrl ? (usuario.fotoUrl.startsWith('http') ? usuario.fotoUrl : `${import.meta.env.VITE_API_BASE || ''}${usuario.fotoUrl}`) : 'https://ui-avatars.com/api/?background=0A5C98&color=fff&name=' + encodeURIComponent(usuario?.nome || 'U')}
          alt="Foto de perfil"
          className="rounded-circle"
          width={38}
          height={38}
          style={{ objectFit: 'cover' }}
        />
        <span className="fw-semibold d-none d-md-inline">{usuario?.nome}</span>
        <button className="btn btn-sm btn-admig-outline ms-2" onClick={logout}>
          <i className="bi bi-box-arrow-right" />
        </button>
      </div>
    </div>
  );
}

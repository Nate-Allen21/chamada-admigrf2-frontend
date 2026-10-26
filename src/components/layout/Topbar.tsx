export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <div className="d-flex align-items-center justify-content-between bg-white border-bottom px-3 py-2 sticky-top">
      <button className="btn d-lg-none" onClick={onToggleSidebar} aria-label="Abrir menu">
        <i className="bi bi-list fs-3 text-brand-primary" />
      </button>
      <div className="d-none d-lg-block" />
      <div className="d-flex align-items-center gap-2">
        <span className="small fw-semibold text-brand-primary">Escola Dominical ADMIG RF II</span>
      </div>
    </div>
  );
}

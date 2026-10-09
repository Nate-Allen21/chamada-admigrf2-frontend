import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar fixa em telas grandes */}
      <div className="d-none d-lg-block">
        <Sidebar />
      </div>

      {/* Sidebar em off-canvas para mobile, estilo "drawer" */}
      {sidebarAberta && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
          style={{ zIndex: 1040, background: 'rgba(13,43,84,0.5)' }}
          onClick={() => setSidebarAberta(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ height: '100%' }}>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Topbar onToggleSidebar={() => setSidebarAberta(true)} />
        <div className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

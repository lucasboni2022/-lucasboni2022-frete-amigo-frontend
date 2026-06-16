import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h5l3 3v5h-8V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const navLinks = [
    { to: '/buscar-cargas', label: 'Buscar Cargas' },
    { to: '/publicar-carga', label: 'Publicar Carga' },
    { to: '/como-funciona', label: 'Como Funciona' },
    { to: '/planos', label: 'Planos' },
  ];

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <TruckIcon />
          </div>
          FreteAmigo
        </Link>

        {/* Nav Links */}
        <div className="navbar-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div className="navbar-user" onClick={() => setDropdownOpen(o => !o)}>
                <div className="navbar-avatar">
                  {getInitials(user?.nome_completo || user?.nome)}
                </div>
                <span className="navbar-user-name">
                  {user?.nome_completo?.split(' ')[0] || user?.nome?.split(' ')[0] || 'Usuário'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Dashboard
                  </Link>
                  <Link to="/perfil" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Meu Perfil
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" className="btn btn-outline btn-sm">
                Entrar
              </Link>
              <Link to="/auth?tab=cadastrar" className="btn btn-primary btn-sm">
                Cadastrar
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid var(--color-border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'block' }}
            >
              {link.label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '8px', paddingTop: '12px', display: 'flex', gap: '10px' }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Sair</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
                <Link to="/auth?tab=cadastrar" className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileMenuOpen(false)}>Cadastrar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

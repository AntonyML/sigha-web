import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  CSS-in-JS via a dedicated stylesheet (UserMenu.css)               */
/* ------------------------------------------------------------------ */
import './UserMenu.css';

interface UserMenuProps {
  /** Display name shown next to the avatar. Falls back to "Usuario". */
  userName?: string;
}

export default function UserMenu({ userName = 'Usuario' }: UserMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const handleProfile = () => {
    setOpen(false);
    navigate('/profile');
  };

  const handleTwoFactor = () => {
    setOpen(false);
    navigate('/two-factor');
  };

  const handleLogout = () => {
    setOpen(false);
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="user-menu-wrapper" ref={containerRef}>
      {/* Trigger button */}
      <button
        className={`user-menu-trigger${open ? ' user-menu-trigger--open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menú de usuario"
      >
        {/* Avatar circle */}
        <span className="user-menu-avatar" aria-hidden="true">
          {initials || <User className="w-4 h-4" />}
        </span>

        {/* Name — hidden on very small screens */}
        <span className="user-menu-name">{userName}</span>

        <ChevronDown
          className={`user-menu-chevron${open ? ' user-menu-chevron--rotated' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="user-menu-dropdown" role="menu" aria-label="Opciones de usuario">
          {/* Header info */}
          <div className="user-menu-header">
            <span className="user-menu-header-avatar" aria-hidden="true">
              {initials || <User className="w-5 h-5" />}
            </span>
            <div className="user-menu-header-text">
              <p className="user-menu-header-name">{userName}</p>
              <p className="user-menu-header-role">Cuenta activa</p>
            </div>
          </div>

          <hr className="user-menu-separator" />

          {/* Actions */}
          <button className="user-menu-item" onClick={handleProfile} role="menuitem">
            <User className="w-4 h-4 user-menu-item-icon" aria-hidden="true" />
            Mi Perfil
          </button>

          <button className="user-menu-item" onClick={handleTwoFactor} role="menuitem">
            <ShieldCheck className="w-4 h-4 user-menu-item-icon" aria-hidden="true" />
            Configurar 2FA
          </button>

          <hr className="user-menu-separator" />

          <button
            className="user-menu-item user-menu-item--danger"
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOut className="w-4 h-4 user-menu-item-icon" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

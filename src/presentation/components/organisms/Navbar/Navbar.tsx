/**
 * Navbar
 *
 * Desktop layout (≥768px):
 *   [Brand]  |  [GlobalSearch]  ——  [DateTime]  [Bell]  [divider]  [UserMenu]
 *
 * Mobile layout (<768px):
 *   Top bar: [Brand]  ——  [Bell]
 *   Bottom tab bar: <MobileBottomNav>
 */

import { useState, useEffect } from 'react';
import type { AuthUser } from '../../../../types/auth';
import { useAppSettings } from '../../../context/SettingsContext';
import UserMenu        from './UserMenu';
import MobileBottomNav from './MobileBottomNav';
import GlobalSearch    from './GlobalSearch';
import NavbarDateTime  from './NavbarDateTime';
import NavbarBell      from './NavbarBell';
import './Navbar.css';

/* ────────────────────────────────────────────────────── */

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function buildDisplayName(user: AuthUser | null): string {
  if (!user) return 'Usuario';
  const parts = [user.uName, user.uFLastName].filter(Boolean);
  return parts.join(' ') || user.uEmail || 'Usuario';
}

/* ────────────────────────────────────────────────────── */

export default function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const { appName } = useAppSettings();

  useEffect(() => {
    const refresh = () => setUser(getStoredUser());
    window.addEventListener('authTokenChanged', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('authTokenChanged', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const displayName = buildDisplayName(user);

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          DESKTOP  — sticky top bar
      ═══════════════════════════════════════════════════ */}
      <nav className="navbar-root" aria-label="Barra de navegación principal">
        <div className="navbar-inner">

          {/* ── Left: Brand ── */}
          <div className="navbar-brand" aria-label={`${appName} — Inicio`}>
            <span className="navbar-brand-icon" aria-hidden="true">
              <span>{appName.charAt(0)}</span>
            </span>
            <span className="navbar-brand-name">{appName}</span>
          </div>

          {/* ── Center: Global search ── */}
          <div className="navbar-center">
            <GlobalSearch />
          </div>

          {/* ── Right: actions cluster ── */}
          <div className="navbar-actions">
            <NavbarDateTime />

            <span className="navbar-divider" aria-hidden="true" />

            <NavbarBell />

            <span className="navbar-divider" aria-hidden="true" />

            <UserMenu userName={displayName} />
          </div>

        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          MOBILE — sticky top bar
      ═══════════════════════════════════════════════════ */}
      <div className="navbar-mobile-top" aria-label="Barra superior">
        <div className="navbar-mobile-top-inner">
          <div className="navbar-brand">
<span className="navbar-brand-icon" aria-hidden="true">
                <span>{appName.charAt(0)}</span>
              </span>
              <span className="navbar-brand-name">{appName}</span>
          </div>

          <NavbarBell />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE — bottom tab navigation
      ═══════════════════════════════════════════════════ */}
      <MobileBottomNav />
    </>
  );
}

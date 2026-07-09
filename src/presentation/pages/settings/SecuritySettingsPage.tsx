/**
 * SecuritySettingsPage — Configuración de seguridad del sistema
 *
 * Cuatro sub-secciones en tabs:
 *   1. Política de contraseñas
 *   2. 2FA obligatorio
 *   3. Sesiones
 *   4. Intentos de login
 *
 * UX/UI copiada de GeneralSettingsPage / InterfaceSettingsPage:
 *   - lp-page, lp-header, lp-card
 *   - PermissionUtils + usePermissions
 *   - Alertas error/success
 *   - Botón Guardar con estado saving
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, Save, ShieldCheck, KeyRound, Monitor, AlertTriangle,
  ChevronLeft, RefreshCw, Trash2, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import {
  securityService,
  type PasswordPolicy,
  type TwoFactorPolicy,
  type SessionPolicy,
  type LoginAttemptsPolicy,
  type ActiveSession,
  type LoginAttemptRecord,
} from '../../../services/securityService';
import { PermissionUtils, usePermissions } from '../../../utils/permissionUtils';
import '../../styles/lp.css';

// ═══════════════════════════════════════════════════════════
//  Tabs
// ═══════════════════════════════════════════════════════════

type TabId = 'password' | 'twofactor' | 'sessions' | 'attempts';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'password',  label: 'Política de contraseñas', icon: <KeyRound size={18} /> },
  { id: 'twofactor', label: '2FA obligatorio',          icon: <ShieldCheck size={18} /> },
  { id: 'sessions',  label: 'Sesiones',                  icon: <Monitor size={18} /> },
  { id: 'attempts',  label: 'Intentos de login',        icon: <AlertTriangle size={18} /> },
];

// ═══════════════════════════════════════════════════════════
//  Componente principal
// ═══════════════════════════════════════════════════════════

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const { canPerformAction, isLoaded } = usePermissions();
  const hasEdit = canPerformAction('settings', 'edit');
  const hasAccess = PermissionUtils.canAccessModule('settings');

  const [activeTab, setActiveTab] = useState<TabId>('password');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ── Estado de cada sub-sección ───────────────────────────
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [twoFactorPolicy, setTwoFactorPolicy] = useState<TwoFactorPolicy | null>(null);
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicy | null>(null);
  const [loginAttemptsPolicy, setLoginAttemptsPolicy] = useState<LoginAttemptsPolicy | null>(null);

  // ── Sesiones activas ──────────────────────────────────────
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // ── Intentos de login ────────────────────────────────────
  const [attempts, setAttempts] = useState<LoginAttemptRecord[]>([]);
  const [attemptsTotal, setAttemptsTotal] = useState(0);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // ── Saving por sub-sección ────────────────────────────────
  const [savingPassword, setSavingPassword] = useState(false);
  const [saving2FA, setSaving2FA] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [savingAttempts, setSavingAttempts] = useState(false);

  // ── Carga inicial ────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (!hasAccess) {
      navigate('/settings');
      return;
    }
    (async () => {
      try {
        const data = await securityService.getSecuritySettings();
        setPasswordPolicy(data.passwordPolicy);
        setTwoFactorPolicy(data.twoFactorPolicy);
        setSessionPolicy(data.sessionPolicy);
        setLoginAttemptsPolicy(data.loginAttemptsPolicy);
      } catch (e: any) {
        // Inicializar con defaults si es la primera vez (endpoint 404)
        const defaults: PasswordPolicy = {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          passwordExpirationDays: 0,
          preventPasswordReuse: 0,
        };
        setPasswordPolicy(defaults);
        setTwoFactorPolicy({ enforceForAll: false, enforceForRoles: [], gracePeriodHours: 0 });
        setSessionPolicy({ maxConcurrentSessions: 0, sessionTimeoutMinutes: 30, maxSessionDurationHours: 0 });
        setLoginAttemptsPolicy({ maxAttempts: 5, lockoutDurationMinutes: 15, attemptWindowMinutes: 30, resetAttemptsOnSuccess: true });
        setError('Configuración de seguridad no encontrada. Usando valores por defecto. Guarda para crear.');
      } finally {
        setLoading(false);
      }
    })();
  }, [hasAccess, isLoaded, navigate]);

  // ── Handlers stub (no funcionales) ─────────────────────
  const loadSessions = useCallback(async () => {
    setSessions([]);
  }, []);

  const loadAttempts = useCallback(async () => {
    // ═══════════════════════════════════════════════════════════
    //  Handlers funcionales para políticas
    // ═══════════════════════════════════════════════════════════

    const handleSavePassword = async () => {
      if (!passwordPolicy || !hasEdit) return;
      setSavingPassword(true);
      setError(null); setMessage(null);
      try {
        const updated = await securityService.updatePasswordPolicy(passwordPolicy);
        setPasswordPolicy(updated);
        setMessage('Política de contraseñas guardada correctamente.');
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Error al guardar la política de contraseñas.');
      } finally { setSavingPassword(false); }
    };

    const handleSave2FA = async () => {
      if (!twoFactorPolicy || !hasEdit) return;
      setSaving2FA(true);
      setError(null); setMessage(null);
      try {
        const updated = await securityService.updateTwoFactorPolicy(twoFactorPolicy);
        setTwoFactorPolicy(updated);
        setMessage('Política 2FA guardada correctamente.');
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Error al guardar la política 2FA.');
      } finally { setSaving2FA(false); }
    };

    const handleSaveSession = async () => {
      if (!sessionPolicy || !hasEdit) return;
      setSavingSession(true);
      setError(null); setMessage(null);
      try {
        const updated = await securityService.updateSessionPolicy(sessionPolicy);
        setSessionPolicy(updated);
        setMessage('Política de sesiones guardada correctamente.');
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Error al guardar la política de sesiones.');
      } finally { setSavingSession(false); }
    };

    const handleSaveAttempts = async () => {
      if (!loginAttemptsPolicy || !hasEdit) return;
      setSavingAttempts(true);
      setError(null); setMessage(null);
      try {
        const updated = await securityService.updateLoginAttemptsPolicy(loginAttemptsPolicy);
        setLoginAttemptsPolicy(updated);
        setMessage('Política de intentos guardada correctamente.');
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'Error al guardar la política de intentos.');
      } finally { setSavingAttempts(false); }
    };

  if (!hasAccess) return null;

  if (loading) {
    return (
      <div className="lp-loading">
        <div className="lp-spinner" />
        <p>Cargando configuración de seguridad…</p>
      </div>
    );
  }

  return (
    <div className="lp-page">
      {/* Header */}
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <Lock size={22} className="mr-2" />
            Seguridad
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Política de contraseñas, 2FA, sesiones activas e intentos de login.
          </p>
        </div>
        <button
          type="button"
          className="lp-btn lp-btn--back"
          onClick={() => navigate('/settings')}
        >
          <ChevronLeft size={16} />
          Volver a Configuración
        </button>
      </div>

      {/* Alertas */}
      {error && <div className="lp-error">{error}<button className="lp-error__retry" onClick={() => setError(null)}>×</button></div>}
      {message && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} color="#16a34a" />
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid #e2e8f0', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setError(null); setMessage(null); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600,
              border: 'none', borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.id ? '#dc2626' : '#64748b',
              cursor: 'pointer', marginBottom: '-2px', transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Política de contraseñas ──────────────────── */}
      {activeTab === 'password' && passwordPolicy && (
        <div className="lp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={18} color="#dc2626" />
            Política de contraseñas
          </h3>

          <div className="mt-4" style={{ display: 'grid', gap: '1rem', maxWidth: '640px' }}>
            {/* Longitud mínima */}
            <div>
              <label className="block font-medium mb-1">Longitud mínima</label>
              <input
                type="number" min={4} max={128}
                value={passwordPolicy.minLength}
                disabled={!hasEdit}
                onChange={e => setPasswordPolicy(prev => prev ? { ...prev, minLength: parseInt(e.target.value) || 8 } : prev)}
                className="input"
              />
            </div>

            {/* Requisitos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: '480px' }}>
              <ToggleRow
                label="Mayúsculas requeridas"
                checked={passwordPolicy.requireUppercase}
                disabled={!hasEdit}
                onChange={v => setPasswordPolicy(prev => prev ? { ...prev, requireUppercase: v } : prev)}
              />
              <ToggleRow
                label="Minúsculas requeridas"
                checked={passwordPolicy.requireLowercase}
                disabled={!hasEdit}
                onChange={v => setPasswordPolicy(prev => prev ? { ...prev, requireLowercase: v } : prev)}
              />
              <ToggleRow
                label="Números requeridos"
                checked={passwordPolicy.requireNumbers}
                disabled={!hasEdit}
                onChange={v => setPasswordPolicy(prev => prev ? { ...prev, requireNumbers: v } : prev)}
              />
              <ToggleRow
                label="Caracteres especiales"
                checked={passwordPolicy.requireSpecialChars}
                disabled={!hasEdit}
                onChange={v => setPasswordPolicy(prev => prev ? { ...prev, requireSpecialChars: v } : prev)}
              />
            </div>

            {/* Expiración */}
            <div>
              <label className="block font-medium mb-1">Expiración de contraseña (días)</label>
              <input
                type="number" min={0} max={365}
                value={passwordPolicy.passwordExpirationDays}
                disabled={!hasEdit}
                onChange={e => setPasswordPolicy(prev => prev ? { ...prev, passwordExpirationDays: parseInt(e.target.value) || 0 } : prev)}
                className="input"
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>0 = sin expiración.</p>
            </div>

            {/* Reutilización */}
            <div>
              <label className="block font-medium mb-1">Evitar reutilización (últimas N)</label>
              <input
                type="number" min={0} max={24}
                value={passwordPolicy.preventPasswordReuse}
                disabled={!hasEdit}
                onChange={e => setPasswordPolicy(prev => prev ? { ...prev, preventPasswordReuse: parseInt(e.target.value) || 0 } : prev)}
                className="input"
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>0 = no prevenir reutilización.</p>
            </div>

            {/* Guardar */}
            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" disabled={savingPassword || !hasEdit} onClick={handleSavePassword} className="lp-btn lp-btn--primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                {savingPassword ? 'Guardando…' : 'Guardar política'}
                {hasEdit && <Save size={16} />}
              </button>
              {!hasEdit && <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>Solo tienes permiso de visualización.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: 2FA obligatorio ───────────────────────────── */}
      {activeTab === 'twofactor' && twoFactorPolicy && (
        <div className="lp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#dc2626" />
            2FA obligatorio
          </h3>

          <div className="mt-4" style={{ display: 'grid', gap: '1rem', maxWidth: '640px' }}>
            <ToggleRow
              label="Forzar 2FA para todos los usuarios"
              checked={twoFactorPolicy.enforceForAll}
              disabled={!hasEdit}
              onChange={v => setTwoFactorPolicy(prev => prev ? { ...prev, enforceForAll: v } : prev)}
            />

            <div>
              <label className="block font-medium mb-1">Roles que deben tener 2FA (separados por coma)</label>
              <input
                value={twoFactorPolicy.enforceForRoles.join(', ')}
                disabled={!hasEdit}
                onChange={e => {
                  const roles = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                  setTwoFactorPolicy(prev => prev ? { ...prev, enforceForRoles: roles } : prev);
                }}
                className="input"
                placeholder="Ej.: SUPER_ADMIN, ADMIN"
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>Se aplica además del checkbox "forzar para todos".</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Período de gracia (horas)</label>
              <input
                type="number" min={0} max={720}
                value={twoFactorPolicy.gracePeriodHours}
                disabled={!hasEdit}
                onChange={e => setTwoFactorPolicy(prev => prev ? { ...prev, gracePeriodHours: parseInt(e.target.value) || 0 } : prev)}
                className="input"
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>Horas antes de bloquear a un usuario sin 2FA. 0 = sin gracia.</p>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" disabled={saving2FA || !hasEdit} onClick={handleSave2FA} className="lp-btn lp-btn--primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                {saving2FA ? 'Guardando…' : 'Guardar política 2FA'}
                {hasEdit && <Save size={16} />}
              </button>
              {!hasEdit && <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>Solo tienes permiso de visualización.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Política de sesiones (funcional) ──────────────── */}
      {activeTab === 'sessions' && sessionPolicy && (
        <div className="lp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Monitor size={18} color="#dc2626" />
            Política de sesiones
          </h3>

          <div className="mt-4" style={{ display: 'grid', gap: '1rem', maxWidth: '640px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="block font-medium mb-1">Sesiones concurrentes máx.</label>
                <input
                  type="number" min={0} max={20}
                  value={sessionPolicy.maxConcurrentSessions}
                  disabled={!hasEdit}
                  onChange={e => setSessionPolicy(prev => prev ? { ...prev, maxConcurrentSessions: parseInt(e.target.value) || 0 } : prev)}
                  className="input"
                />
                <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>0 = ilimitadas.</p>
              </div>
              <div>
                <label className="block font-medium mb-1">Timeout por inactividad (min)</label>
                <input
                  type="number" min={1} max={1440}
                  value={sessionPolicy.sessionTimeoutMinutes}
                  disabled={!hasEdit}
                  onChange={e => setSessionPolicy(prev => prev ? { ...prev, sessionTimeoutMinutes: parseInt(e.target.value) || 30 } : prev)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Duración máxima de sesión (horas)</label>
              <input
                type="number" min={0} max={168}
                value={sessionPolicy.maxSessionDurationHours}
                disabled={!hasEdit}
                onChange={e => setSessionPolicy(prev => prev ? { ...prev, maxSessionDurationHours: parseInt(e.target.value) || 0 } : prev)}
                className="input"
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>0 = sin límite.</p>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" disabled={savingSession || !hasEdit} onClick={handleSaveSession} className="lp-btn lp-btn--primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                {savingSession ? 'Guardando…' : 'Guardar política'}
                {hasEdit && <Save size={16} />}
              </button>
              {!hasEdit && <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>Solo tienes permiso de visualización.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Sesiones activas (stub — no funcional) ──────────────── */}
      {activeTab === 'sessions' && (
        <div className="lp-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#dc2626" />
              Sesiones activas
              <span className="lp-badge lp-badge--secondary">stub</span>
            </h3>
          </div>

          <div className="lp-table-wrap">
            <div className="lp-empty" style={{ padding: '4rem' }}>
              <Monitor size={48} className="lp-empty__icon" />
              <p>Funcionalidad en desarrollo, requiere endpoint dedicado.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Intentos de login (stub — no funcional) ──────────────── */}
      {activeTab === 'attempts' && loginAttemptsPolicy && (
        <div className="lp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#dc2626" />
            Política de intentos de login
          </h3>

          <div className="mt-4" style={{ display: 'grid', gap: '1rem', maxWidth: '640px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="block font-medium mb-1">Intentos máximos</label>
                <input
                  type="number" min={1} max={20}
                  value={loginAttemptsPolicy.maxAttempts}
                  disabled={!hasEdit}
                  onChange={e => setLoginAttemptsPolicy(prev => prev ? { ...prev, maxAttempts: parseInt(e.target.value) || 5 } : prev)}
                  className="input"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Bloqueo (min)</label>
                <input
                  type="number" min={1} max={1440}
                  value={loginAttemptsPolicy.lockoutDurationMinutes}
                  disabled={!hasEdit}
                  onChange={e => setLoginAttemptsPolicy(prev => prev ? { ...prev, lockoutDurationMinutes: parseInt(e.target.value) || 15 } : prev)}
                  className="input"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Ventana (min)</label>
                <input
                  type="number" min={1} max={1440}
                  value={loginAttemptsPolicy.attemptWindowMinutes}
                  disabled={!hasEdit}
                  onChange={e => setLoginAttemptsPolicy(prev => prev ? { ...prev, attemptWindowMinutes: parseInt(e.target.value) || 30 } : prev)}
                  className="input"
                />
              </div>
            </div>

            <ToggleRow
              label="Reiniciar contador al iniciar sesión correctamente"
              checked={loginAttemptsPolicy.resetAttemptsOnSuccess}
              disabled={!hasEdit}
              onChange={v => setLoginAttemptsPolicy(prev => prev ? { ...prev, resetAttemptsOnSuccess: v } : prev)}
            />

            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" disabled={savingAttempts || !hasEdit} onClick={handleSaveAttempts} className="lp-btn lp-btn--primary" style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                {savingAttempts ? 'Guardando…' : 'Guardar política'}
                {hasEdit && <Save size={16} />}
              </button>
              {!hasEdit && <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#94a3b8' }}>Solo tienes permiso de visualización.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attempts' && (
        <div className="lp-card" style={{ overflow: 'hidden' }}>
          export default function SecuritySettingsPage() {
            const navigate = useNavigate();
            const { canPerformAction, isLoaded } = usePermissions();
            const hasEdit = canPerformAction('settings', 'edit');
            const hasAccess = PermissionUtils.canAccessModule('settings');

            const [activeTab, setActiveTab] = useState<TabId>('password');
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState<string | null>(null);
            const [message, setMessage] = useState<string | null>(null);

            // ... (todo el componente) ...

            return (
              <div className="lp-page">
                {/* ... (todo el JSX) ... */}
              </div>
            );
          }

          // ═══════════════════════════════════════════════════════════
          // Sub-componentes
          // ═══════════════════════════════════════════════════════════

          function ToggleRow({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (v: boolean) => void }) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(!checked)}
                  style={{
                    width: '3rem', height: '1.5rem', borderRadius: '999px',
                    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                    background: checked ? '#dc2626' : '#cbd5e1',
                    position: 'relative', transition: 'background 0.2s', opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '0.1875rem', left: checked ? '1.5625rem' : '0.1875rem',
                    width: '1.125rem', height: '1.125rem', borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            );
          }

          function formatDate(iso: string): string {
            if (!iso) return '—';
            try {
              const d = new Date(iso);
              return d.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' });
            } catch {
              return iso;
            }
          }


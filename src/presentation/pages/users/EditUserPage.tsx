/**
 * EditUserPage — Editar usuario existente
 *
 * Mejoras de UX/RBAC:
 *   - Muestra el rol actual del usuario de forma prominente (no editable)
 *     antes del selector de nuevo rol.
 *   - El selector de nuevo rol arranca preseleccionado en el rol actual
 *     del usuario (si se puede resolver).
 *   - Distingue visualmente "rol actual" de "seleccionar nuevo rol".
 *   - Muestra un resumen de cambio "X → Y" al seleccionar un rol distinto.
 *   - El campo roleId en el submit solo se envía si el rol nuevo es distinto
 *     al rol actual, evitando actualizaciones fantasma.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userManagementFlow } from '../../../infrastructure/flows/userManagement';
import { roleFlow } from '../../../infrastructure/flows/role';
import { getFullName } from '../../../utils/userUtils';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { User, UserRole, UpdateUserData } from '../../../types/user';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import '../../styles/lp.css';

/* ─── Tipos internos ──────────────────────────────────────── */

interface UserFormData {
  uIdentification: string;
  uName: string;
  uFLastName: string;
  uSLastName: string;
  uEmail: string;
  uPassword: string;
  newRoleId: number; // 0 = sin cambio
}

/* ─── Helper: resolver rol actual del usuario ─────────────── */

function resolveCurrentRoleId(user: User): number {
  if (user.roleId) return user.roleId;
  if (user.roleIds && user.roleIds.length > 0) return user.roleIds[0];
  return 0;
}

function resolveCurrentRoleNames(user: User, catalog: UserRole[]): string[] {
  if (user.roles && user.roles.length > 0) return user.roles;
  if (user.roleIds && user.roleIds.length > 0 && catalog.length > 0) {
    return user.roleIds
      .map(rid => catalog.find(r => r.id === rid)?.rName)
      .filter((n): n is string => Boolean(n));
  }
  if (user.roleId && catalog.length > 0) {
    const r = catalog.find(r => r.id === user.roleId);
    return r ? [r.rName] : [];
  }
  return [];
}

/* ─── Subcomponentes locales ──────────────────────────────── */

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lp-card" style={{ marginBottom: '1rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
        <h5 style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className={`bi ${icon}`} style={{ color: '#2563eb' }} />
          {title}
        </h5>
        {subtitle && (
          <small style={{ color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>{subtitle}</small>
        )}
      </div>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  );
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Página principal ────────────────────────────────────── */

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const feedback = useFeedbackWithNotifications();

  const [formData, setFormData] = useState<UserFormData>({
    uIdentification: '',
    uName: '',
    uFLastName: '',
    uSLastName: '',
    uEmail: '',
    uPassword: '',
    newRoleId: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Rol actual resuelto del usuario (nombre y ID)
  const currentRoleId = originalUser ? resolveCurrentRoleId(originalUser) : 0;
  const currentRoleNames = originalUser ? resolveCurrentRoleNames(originalUser, roles) : [];
  const currentRoleName = currentRoleNames.length > 0 ? currentRoleNames[0] : null;

  // Nombre del nuevo rol seleccionado
  const selectedRoleName = formData.newRoleId
    ? roles.find(r => r.id === formData.newRoleId)?.rName ?? null
    : null;

  // ¿El usuario realmente está cambiando el rol?
  const isChangingRole = formData.newRoleId !== 0 && formData.newRoleId !== currentRoleId;

  /* ── Carga de datos ─────────────────────────────────────── */

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [userResult, rolesResult] = await Promise.all([
        userManagementFlow.getUserById(Number(id)),
        roleFlow.getAllRoles(),
      ]);

      if (userResult.success && userResult.user) {
        const u = userResult.user;
        setOriginalUser(u);
        setFormData({
          uIdentification: u.uIdentification || '',
          uName: u.uName || '',
          uFLastName: u.uFLastName || '',
          uSLastName: u.uSLastName || '',
          uEmail: u.uEmail || '',
          uPassword: '',
          newRoleId: 0, // sin cambio por defecto
        });
      } else {
        setError(userResult.error || 'Error al cargar usuario');
      }

      if (rolesResult.success && rolesResult.roles) {
        setRoles(rolesResult.roles);
      }
    } catch {
      setError('Error inesperado al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    loadData();
  }, [id, loadData]);

  /* ── Cambio de campos ───────────────────────────────────── */

  function onInputChange(field: keyof UserFormData, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  /* ── Submit ─────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) { setError('ID de usuario no válido'); return; }
    setError('');
    setSaving(true);

    const updateData: UpdateUserData = {};

    if (formData.uIdentification !== (originalUser?.uIdentification || ''))
      updateData.uIdentification = formData.uIdentification;
    if (formData.uName !== originalUser?.uName)
      updateData.uName = formData.uName;
    if (formData.uFLastName !== originalUser?.uFLastName)
      updateData.uFLastName = formData.uFLastName;
    if (formData.uSLastName !== (originalUser?.uSLastName || ''))
      updateData.uSLastName = formData.uSLastName || undefined;
    if (formData.uEmail !== originalUser?.uEmail)
      updateData.uEmail = formData.uEmail;

    // Solo enviar roleId si realmente hay un cambio de rol
    if (isChangingRole) {
      updateData.roleId = formData.newRoleId;
    }

    updateData.uIsActive = true;

    if (Object.keys(updateData).length <= 1) {
      setError('No se detectaron cambios para guardar');
      setSaving(false);
      return;
    }

    const result = await userManagementFlow.updateUser(Number(id), updateData);

    if (result.success) {
      feedback.success(result.message || 'Usuario actualizado exitosamente');
      feedback.showNotification({
        title: 'Usuario actualizado',
        message: 'El usuario ha sido actualizado correctamente en el sistema.',
        variant: 'success',
      });
      navigate('/users');
    } else {
      setError(result.error || 'Error al actualizar usuario');
    }

    setSaving(false);
  }

  /* ── Estados de carga / error ─────────────────────────── */

  if (!id) {
    return (
      <div className="lp-page">
        <div className="lp-error">
          <i className="bi bi-exclamation-triangle" />
          <span>No se proporcionó un ID de usuario.</span>
          <button className="lp-btn lp-btn--back lp-error__retry" onClick={() => navigate('/users')}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lp-loading" style={{ minHeight: '60vh' }}>
        <div className="lp-spinner" />
        <span>Cargando información del usuario…</span>
      </div>
    );
  }

  if (error && !originalUser) {
    return (
      <div className="lp-page">
        <div className="lp-error">
          <i className="bi bi-exclamation-circle" />
          <span>{error}</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button className="lp-btn lp-btn--back" onClick={() => navigate('/users')}>Volver</button>
            <button className="lp-btn lp-btn--primary lp-error__retry" onClick={loadData}>Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render principal ─────────────────────────────────── */

  return (
    <div className="lp-page">

      {/* Encabezado */}
      <div className="lp-header">
        <div>
          <h2 className="lp-title">Editar usuario</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            {originalUser ? getFullName(originalUser) : `#${id}`}
          </p>
        </div>
        <button
          className="lp-btn lp-btn--back"
          onClick={() => navigate('/users')}
          disabled={saving}
        >
          <i className="bi bi-arrow-left" /> Volver
        </button>
      </div>

      {error && (
        <AlertMessage
          type="danger"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Información personal ───────────────────────── */}
        <SectionCard icon="bi-person-circle" title="Información personal">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <FieldGroup label="Identificación" required>
              <input
                type="text"
                className="form-control form-control-lg"
                value={formData.uIdentification}
                onChange={e => onInputChange('uIdentification', e.target.value)}
                pattern="^[0-9]+$"
                title="Solo números"
                required
                disabled={saving}
              />
            </FieldGroup>
            <FieldGroup label="Nombre" required>
              <input
                type="text"
                className="form-control form-control-lg"
                value={formData.uName}
                onChange={e => onInputChange('uName', e.target.value)}
                required
                disabled={saving}
              />
            </FieldGroup>
            <FieldGroup label="Primer apellido" required>
              <input
                type="text"
                className="form-control form-control-lg"
                value={formData.uFLastName}
                onChange={e => onInputChange('uFLastName', e.target.value)}
                required
                disabled={saving}
              />
            </FieldGroup>
            <FieldGroup label="Segundo apellido">
              <input
                type="text"
                className="form-control form-control-lg"
                value={formData.uSLastName}
                onChange={e => onInputChange('uSLastName', e.target.value)}
                placeholder="Opcional"
                disabled={saving}
              />
            </FieldGroup>
          </div>
        </SectionCard>

        {/* ── Correo electrónico ─────────────────────────── */}
        <SectionCard icon="bi-envelope" title="Correo electrónico">
          <FieldGroup label="Correo" required>
            <input
              type="email"
              className="form-control form-control-lg"
              value={formData.uEmail}
              onChange={e => onInputChange('uEmail', e.target.value)}
              required
              disabled={saving}
            />
          </FieldGroup>
        </SectionCard>

        {/* ── Rol del usuario ────────────────────────────── */}
        <SectionCard
          icon="bi-person-badge"
          title="Rol del usuario"
          subtitle="El rol determina los permisos del usuario en todo el sistema."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Rol actual — no editable, solo informativo */}
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rol actual
              </p>
              {currentRoleName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.4rem 0.875rem',
                      borderRadius: '999px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      border: '1.5px solid #bfdbfe',
                    }}
                  >
                    <i className="bi bi-person-badge" />
                    {currentRoleName}
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: '#1d4ed8',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '0.1rem 0.4rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Principal
                    </span>
                  </span>
                  {currentRoleNames.length > 1 && (
                    <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                      + {currentRoleNames.length - 1} más
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  <i className="bi bi-dash-circle me-1" />
                  Sin rol asignado
                </span>
              )}
            </div>

            {/* Separador */}
            <div style={{ borderTop: '1px solid #f1f5f9' }} />

            {/* Selector de nuevo rol */}
            <FieldGroup label="Cambiar rol">
              <select
                className="form-select form-select-lg"
                value={formData.newRoleId}
                onChange={e => onInputChange('newRoleId', Number(e.target.value))}
                disabled={saving}
              >
                <option value={0}>— Mantener rol actual —</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.rName}
                    {role.id === currentRoleId ? ' (actual)' : ''}
                  </option>
                ))}
              </select>
              <small style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
                Deja en "Mantener rol actual" si no deseas cambiar el rol.
              </small>
            </FieldGroup>

            {/* Resumen de cambio — solo visible si hay cambio real */}
            {isChangingRole && selectedRoleName && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  background: '#fefce8',
                  border: '1.5px solid #fde68a',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                }}
              >
                <i className="bi bi-arrow-right-circle-fill" style={{ color: '#d97706', fontSize: '1.125rem', flexShrink: 0 }} />
                <span style={{ color: '#92400e' }}>
                  Se cambiará el rol de{' '}
                  <strong>{currentRoleName ?? 'sin rol'}</strong>
                  {' → '}
                  <strong>{selectedRoleName}</strong>
                </span>
              </div>
            )}

          </div>
        </SectionCard>

        {/* ── Contraseña ─────────────────────────────────── */}
        <SectionCard
          icon="bi-shield-lock"
          title="Contraseña"
          subtitle="Dejar vacío para mantener la contraseña actual"
        >
          <div style={{ maxWidth: '360px' }}>
            <FieldGroup label="Nueva contraseña">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control form-control-lg"
                  value={formData.uPassword}
                  onChange={e => onInputChange('uPassword', e.target.value)}
                  placeholder="Dejar vacío para no cambiar"
                  disabled={saving}
                  minLength={8}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute', top: '50%', right: '0.75rem',
                    transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', padding: 0, color: '#94a3b8',
                  }}
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </FieldGroup>
          </div>
        </SectionCard>

        {/* ── Acciones ───────────────────────────────────── */}
        <div className="lp-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="submit"
              className="lp-btn lp-btn--primary"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.9375rem' }}
              disabled={saving}
            >
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" /> Guardando…</>
              ) : (
                <><i className="bi bi-check-circle me-1" /> Guardar cambios</>
              )}
            </button>
            <button
              type="button"
              className="lp-btn lp-btn--back"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.9375rem' }}
              onClick={() => navigate('/users')}
              disabled={saving}
            >
              <i className="bi bi-x-circle me-1" /> Cancelar
            </button>
            <button
              type="button"
              className="lp-btn lp-btn--info"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.9375rem' }}
              onClick={() => navigate(`/users/view/${id}`)}
              disabled={saving}
            >
              <i className="bi bi-eye me-1" /> Ver detalles
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

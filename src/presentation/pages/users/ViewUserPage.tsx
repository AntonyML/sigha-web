/**
 * ViewUserPage — Detalle de usuario
 *
 * Muestra el estado real del usuario incluyendo su rol/roles.
 * Fuente de verdad de roles (en orden de prioridad):
 *   1. user.roles[]   — array de nombres devuelto por el backend
 *   2. user.roleIds[] — array de IDs cruzado con la lista de roles
 *   3. user.roleId    — ID único (rol primario)
 *   4. Lista de roles cargada desde roleFlow (fallback de nombre)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFullName } from '../../../utils/userUtils';
import { userManagementFlow } from '../../../infrastructure/flows/userManagement';
import { roleFlow } from '../../../infrastructure/flows/role';
import type { User, UserRole } from '../../../types/user';
import '../../styles/lp.css';

/* ─── Helpers ─────────────────────────────────────────────── */

/**
 * Devuelve la lista de nombres de roles del usuario usando la mejor
 * fuente disponible: user.roles[] > user.roleIds[] cruzado > user.roleId.
 * Nunca devuelve un array vacío si hay alguna data — en ese caso devuelve [].
 */
function resolveRoleNames(user: User, catalog: UserRole[]): string[] {
  // Fuente 1: nombres ya en el objeto
  if (user.roles && user.roles.length > 0) {
    return user.roles;
  }

  // Fuente 2: roleIds[] cruzados con el catálogo
  if (user.roleIds && user.roleIds.length > 0 && catalog.length > 0) {
    const names = user.roleIds
      .map(rid => catalog.find(r => r.id === rid)?.rName)
      .filter((n): n is string => Boolean(n));
    if (names.length > 0) return names;
  }

  // Fuente 3: roleId único
  if (user.roleId && catalog.length > 0) {
    const role = catalog.find(r => r.id === user.roleId);
    if (role) return [role.rName];
  }

  return [];
}

/* ─── Subcomponentes ──────────────────────────────────────── */

function RoleBadge({ name, isPrimary }: { name: string; isPrimary: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        background: '#dbeafe',
        color: '#1d4ed8',
        fontSize: '0.8125rem',
        fontWeight: 600,
        border: '1.5px solid #bfdbfe',
      }}
    >
      <i className="bi bi-person-badge" />
      {name}
      {isPrimary && (
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: '#1d4ed8',
            color: '#fff',
            borderRadius: '999px',
            padding: '0.1rem 0.4rem',
          }}
        >
          Principal
        </span>
      )}
    </span>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lp-card" style={{ marginBottom: '1rem' }}>
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafafa',
        }}
      >
        <h5 style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className={`bi ${icon} text-primary`} />
          {title}
        </h5>
        <small style={{ color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>{subtitle}</small>
      </div>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <small style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
        {label}
      </small>
      <div style={{ fontSize: '0.9375rem', color: '#1e293b' }}>{children}</div>
    </div>
  );
}

/* ─── Página principal ────────────────────────────────────── */

export default function ViewUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [roleCatalog, setRoleCatalog] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [userResult, rolesResult] = await Promise.all([
          userManagementFlow.getUserById(Number(id)),
          roleFlow.getAllRoles(),
        ]);

        if (userResult.success && userResult.user) {
          setUser(userResult.user);
        } else {
          setError(userResult.error || 'Error al cargar usuario');
        }

        if (rolesResult.success && rolesResult.roles) {
          setRoleCatalog(rolesResult.roles);
        }
      } catch {
        setError('Error inesperado al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

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

  if (error || !user) {
    return (
      <div className="lp-page">
        <div className="lp-error">
          <i className="bi bi-exclamation-circle" />
          <span>{error || 'No se pudo cargar la información del usuario.'}</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button className="lp-btn lp-btn--back" onClick={() => navigate('/users')}>Volver</button>
            <button className="lp-btn lp-btn--primary lp-error__retry" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Resolver roles del usuario ───────────────────────── */

  const roleNames = resolveRoleNames(user, roleCatalog);
  const hasRoles = roleNames.length > 0;

  return (
    <div className="lp-page">

      {/* ── Encabezado ───────────────────────────────────── */}
      <div className="lp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i className="bi bi-person-fill" style={{ fontSize: '1.5rem', color: '#2563eb' }} />
          </div>
          <div>
            <h2 className="lp-title" style={{ fontSize: '1.375rem' }}>{getFullName(user)}</h2>
            <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8125rem' }}>
              Usuario #{id}
              {hasRoles && (
                <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>
                  · {roleNames[0]}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/users')}>
            <i className="bi bi-arrow-left" /> Volver
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate(`/users/edit/${id}`)}>
            <i className="bi bi-pencil" /> Editar
          </button>
        </div>
      </div>

      {/* ── Card: Rol y acceso ───────────────────────────── */}
      <SectionCard
        icon="bi-person-badge"
        title="Rol y acceso"
        subtitle="Rol asignado que determina los permisos del usuario en el sistema"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Rol(es) */}
          <FieldRow label="Rol del usuario">
            {hasRoles ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {roleNames.map((name, idx) => (
                  <RoleBadge key={name} name={name} isPrimary={idx === 0} />
                ))}
              </div>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  padding: '0.35rem 0.75rem',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '999px',
                }}
              >
                <i className="bi bi-dash-circle" />
                Sin rol asignado
              </span>
            )}
          </FieldRow>

          {/* Estado de cuenta */}
          <FieldRow label="Estado de la cuenta">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: user.uIsActive ? '#dcfce7' : '#fee2e2',
                color: user.uIsActive ? '#15803d' : '#b91c1c',
                border: `1.5px solid ${user.uIsActive ? '#bbf7d0' : '#fca5a5'}`,
              }}
            >
              <i className={`bi ${user.uIsActive ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
              {user.uIsActive ? 'Activo' : 'Inactivo'}
            </span>
          </FieldRow>

        </div>
      </SectionCard>

      {/* ── Card: Información personal ──────────────────── */}
      <SectionCard
        icon="bi-person-circle"
        title="Información personal"
        subtitle="Datos de identificación del usuario"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <FieldRow label="Identificación">{user.uIdentification || '—'}</FieldRow>
          <FieldRow label="Nombre">{user.uName || '—'}</FieldRow>
          <FieldRow label="Primer apellido">{user.uFLastName || '—'}</FieldRow>
          <FieldRow label="Segundo apellido">{user.uSLastName || '—'}</FieldRow>
        </div>
      </SectionCard>

      {/* ── Card: Contacto ──────────────────────────────── */}
      <SectionCard
        icon="bi-envelope"
        title="Información de contacto"
        subtitle="Datos de comunicación del usuario"
      >
        <FieldRow label="Correo electrónico">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-envelope" style={{ color: '#94a3b8' }} />
            <span>{user.uEmail || '—'}</span>
            {user.uEmailVerified && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <i className="bi bi-patch-check-fill" />
                Verificado
              </span>
            )}
          </div>
        </FieldRow>
      </SectionCard>

      {/* ── Card: Información adicional ─────────────────── */}
      <SectionCard
        icon="bi-clock-history"
        title="Información adicional"
        subtitle="Metadatos históricos de la cuenta"
      >
        <FieldRow label="Fecha de creación">
          {user.createAt
            ? new Date(user.createAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : '—'}
        </FieldRow>
      </SectionCard>

    </div>
  );
}

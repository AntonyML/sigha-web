import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleFlow } from '../../../infrastructure/flows/role';
import { permissionApiService } from '../../../services/permissionApiService';
import { PermissionUtils } from '../../../utils/permissionUtils';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { CreateRoleData } from '../../../types/user';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

const defaultRoleFormData: CreateRoleData = {
    rName: '',
    rDescription: '',
    rIsAdmin: false,
    rRequires2FA: false,
    rIsActive: true
};

export default function CreateRolePage() {
    const [formData, setFormData] = useState<CreateRoleData>(defaultRoleFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof permissionApiService.getAll>>>([]);
    const [grantedIds, setGrantedIds] = useState<Set<number>>(new Set());
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    useEffect(() => {
        const checkAndLoad = async () => {
            try {
                const canManage = await PermissionUtils.canManageRoles();
                setHasPermission(canManage);
                if (!canManage) return;

                setPermissionsLoading(true);
                const cat = await permissionApiService.getAll();
                setCatalog(cat);
                setGrantedIds(new Set()); // no permissions granted initially
            } catch (err) {
                console.error('Error verificando permisos o cargando catálogo:', err);
            } finally {
                setPermissionsLoading(false);
            }
        };
        checkAndLoad();
    }, []);

    const groupedByModule = useMemo(() => {
        const byModule: Record<string, typeof catalog> = {};
        for (const p of catalog) {
            if (!byModule[p.pModule]) byModule[p.pModule] = [];
            byModule[p.pModule].push(p);
        }
        for (const m of Object.keys(byModule)) {
            byModule[m].sort((a, b) => a.pAction.localeCompare(b.pAction));
        }
        return byModule;
    }, [catalog]);

    function onInputChange(field: keyof CreateRoleData, value: string | boolean) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    function togglePermission(permId: number, checked: boolean) {
        setGrantedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(permId); else next.delete(permId);
            return next;
        });
    }

    function toggleModuleAll(module: string, checked: boolean) {
        setGrantedIds(prev => {
            const next = new Set(prev);
            for (const p of catalog) {
                if (p.pModule !== module) continue;
                if (checked) next.add(p.id); else next.delete(p.id);
            }
            return next;
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (hasPermission === false) { setError('No tienes permisos para crear roles.'); return; }
        if (!formData.rName.trim()) { setError('Por favor ingresa el nombre del rol'); return; }
        if (formData.rName.trim().length < 3) { setError('El nombre del rol debe tener al menos 3 caracteres'); return; }

        setLoading(true);
        try {
            const result = await roleFlow.createRole(formData);
            if (result.success && result.role) {
                // Persistir permisos del nuevo rol en el backend
                try {
                    await permissionApiService.setRolePermissions(result.role.id, Array.from(grantedIds));
                } catch (permError) {
                    console.error('Error guardando permisos del rol:', permError);
                    feedback.error('Rol creado pero error al guardar permisos');
                }

                feedback.success('Rol creado exitosamente');
                feedback.showNotification({
                    title: 'Rol creado',
                    message: `El rol "${result.role.rName}" ha sido creado exitosamente.`,
                    variant: 'success'
                });
                navigate('/roles');
            } else {
                setError(result.error || 'Error al crear rol');
            }
        } catch (err: any) {
            console.error('Error creando rol:', err);
            setError(err?.response?.data?.message || 'Error inesperado al crear el rol');
        } finally {
            setLoading(false);
        }
    }

    if (hasPermission === false) {
        return (
            <div className="min-vh-100 bg-light">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <AlertMessage type="warning" title="Sin permisos">
                                No tienes permisos para crear roles. Solo los administradores del sistema pueden crear nuevos roles.
                            </AlertMessage>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Crear Nuevo Rol</h1>
                                <p className="text-muted mb-0">Define un nuevo rol y asigna sus permisos</p>
                            </div>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/roles')}>
                                <i className="bi bi-arrow-left"></i> Volver a la lista
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                                <button type="button" className="btn-close" onClick={() => setError('')}></button>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-12 col-lg-8">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-plus me-2 text-primary"></i>Información del Rol
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="rName" className="form-label fw-semibold">Nombre del Rol <span className="text-danger">*</span></label>
                                            <input id="rName" type="text" className="form-control form-control-lg" value={formData.rName} onChange={e => onInputChange('rName', e.target.value)} placeholder="Ej: Coordinador de Enfermería" required disabled={loading} minLength={3} maxLength={100} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="rDescription" className="form-label fw-semibold">Descripción</label>
                                            <input id="rDescription" type="text" className="form-control form-control-lg" value={formData.rDescription ?? ''} onChange={e => onInputChange('rDescription', e.target.value)} placeholder="Describe las responsabilidades y permisos de este rol..." disabled={loading} maxLength={255} />
                                        </div>
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" id="rIsAdmin" checked={formData.rIsAdmin ?? false} onChange={e => onInputChange('rIsAdmin', e.target.checked)} disabled={loading} />
                                                <label className="form-check-label" htmlFor="rIsAdmin">Rol administrativo (permisos elevados)</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" id="rRequires2FA" checked={formData.rRequires2FA ?? false} onChange={e => onInputChange('rRequires2FA', e.target.checked)} disabled={loading} />
                                                <label className="form-check-label" htmlFor="rRequires2FA">Requiere autenticación 2FA</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-key me-2 text-primary"></i>Permisos del Rol
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <p className="text-muted small mb-3">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Configura los permisos que tendrá este rol. Los cambios se aplican en el servidor al guardar.
                                    </p>
                                    {permissionsLoading ? (
                                        <LoadingSpinner message="Cargando catálogo de permisos..." size="sm" />
                                    ) : Object.keys(groupedByModule).length === 0 ? (
                                        <p className="text-muted text-center mb-0">No hay permisos definidos en el sistema.</p>
                                    ) : (
                                        <div className="row g-3">
                                            {Object.entries(groupedByModule).map(([module, perms]) => {
                                                const allChecked = perms.every(p => grantedIds.has(p.id));
                                                return (
                                                    <div key={module} className="col-12">
                                                        <div className="border rounded p-3 bg-white">
                                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                                <h6 className="fw-semibold mb-0 text-capitalize">{module}</h6>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" id={`mod-${module}`}
                                                                        checked={allChecked}
                                                                        onChange={e => toggleModuleAll(module, e.target.checked)}
                                                                        disabled={loading} />
                                                                    <label className="form-check-label small" htmlFor={`mod-${module}`}>Todos</label>
                                                                </div>
                                                            </div>
                                                            <div className="row g-2">
                                                                {perms.map(p => (
                                                                    <div key={p.id} className="col-12 col-md-6 col-lg-3">
                                                                        <div className="form-check">
                                                                            <input className="form-check-input" type="checkbox" id={`perm-${p.id}`}
                                                                                checked={grantedIds.has(p.id)}
                                                                                onChange={e => togglePermission(p.id, e.target.checked)}
                                                                                disabled={loading || !p.pEnabled} />
                                                                            <label className="form-check-label text-capitalize" htmlFor={`perm-${p.id}`}>
                                                                                {p.pAction}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button type="submit" className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                                            {loading
                                                ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando rol...</>
                                                : <><i className="bi bi-check-circle"></i> Crear Rol</>}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={() => navigate('/roles')} disabled={loading}>
                                            <i className="bi bi-x-circle me-2"></i>Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

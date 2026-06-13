import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleFlow } from '../../../infrastructure/flows/role';
import { permissionApiService } from '../../../services/permissionApiService';
import { PermissionUtils } from '../../../utils/permissionUtils';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type { UpdateRoleData } from '../../../types/user';
import { AlertMessage } from '../../components/molecules/AlertMessage/AlertMessage';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

interface RoleFormData {
    rName: string;
    rDescription?: string;
    rIsAdmin?: boolean;
    rRequires2FA?: boolean;
    rIsActive?: boolean;
}

export default function EditRolePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const [formData, setFormData] = useState<RoleFormData>({
        rName: '', rDescription: '', rIsAdmin: false, rRequires2FA: false, rIsActive: true
    });
    const [originalData, setOriginalData] = useState<RoleFormData>({
        rName: '', rDescription: '', rIsAdmin: false, rRequires2FA: false, rIsActive: true
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const [catalog, setCatalog] = useState<Awaited<ReturnType<typeof permissionApiService.getAll>>>([]);
    const [grantedIds, setGrantedIds] = useState<Set<number>>(new Set());
    const [originalGrantedIds, setOriginalGrantedIds] = useState<Set<number>>(new Set());
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    useEffect(() => {
        const checkAndLoad = async () => {
            if (!id) { setError('ID de rol no proporcionado'); setLoadingData(false); return; }
            try {
                const canManage = await PermissionUtils.canManageRoles();
                setHasPermission(canManage);
                if (!canManage) { setLoadingData(false); return; }

                setLoadingData(true); setError('');

                const result = await roleFlow.getRoleById(Number(id));
                if (result.success && result.role) {
                    const roleData: RoleFormData = {
                        rName: result.role.rName,
                        rDescription: result.role.rDescription || '',
                        rIsAdmin: result.role.rIsAdmin || false,
                        rRequires2FA: result.role.rRequires2FA || false,
                        rIsActive: result.role.rIsActive !== undefined ? result.role.rIsActive : true
                    };
                    setFormData(roleData);
                    setOriginalData(roleData);

                    // Cargar catálogo + permisos del rol desde el backend
                    setPermissionsLoading(true);
                    const [cat, rolePerms] = await Promise.all([
                        permissionApiService.getAll(),
                        permissionApiService.getByRole(Number(id)),
                    ]);
                    setCatalog(cat);
                    const granted = new Set(rolePerms.filter(rp => rp.rpGranted).map(rp => rp.permissionId));
                    setGrantedIds(granted);
                    setOriginalGrantedIds(new Set(granted));
                } else {
                    setError(result.error || 'Error al cargar rol');
                }
            } catch (err: any) {
                console.error('Error cargando rol/permisos:', err);
                setError(err?.response?.data?.message || 'Error inesperado al cargar el rol');
            } finally {
                setLoadingData(false);
                setPermissionsLoading(false);
            }
        };
        checkAndLoad();
    }, [id]);

    useEffect(() => {
        const formChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
        const permChanges = !setsEqual(grantedIds, originalGrantedIds);
        setHasChanges(formChanges || permChanges);
    }, [formData, originalData, grantedIds, originalGrantedIds]);

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

    function onInputChange(field: keyof RoleFormData, value: string | boolean) {
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

    function permChanged(permId: number): boolean {
        return grantedIds.has(permId) !== originalGrantedIds.has(permId);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (hasPermission === false) { setError('No tienes permisos para editar roles.'); return; }
        if (!formData.rName.trim()) { setError('Por favor ingresa el nombre del rol'); return; }
        if (formData.rName.trim().length < 3) { setError('El nombre del rol debe tener al menos 3 caracteres'); return; }
        if (!hasChanges) { setError('No hay cambios para guardar'); return; }

        setLoading(true);
        try {
            const updateData: UpdateRoleData = {};
            if (formData.rName !== originalData.rName) updateData.rName = formData.rName;
            if (formData.rDescription !== originalData.rDescription) updateData.rDescription = formData.rDescription;
            if (formData.rIsAdmin !== originalData.rIsAdmin) updateData.rIsAdmin = formData.rIsAdmin;
            if (formData.rRequires2FA !== originalData.rRequires2FA) updateData.rRequires2FA = formData.rRequires2FA;
            if (formData.rIsActive !== originalData.rIsActive) updateData.rIsActive = formData.rIsActive;

            const result = await roleFlow.updateRole(Number(id), updateData);

            if (result.success && result.role) {
                if (!setsEqual(grantedIds, originalGrantedIds)) {
                    try {
                        await permissionApiService.setRolePermissions(result.role.id, Array.from(grantedIds));
                        setOriginalGrantedIds(new Set(grantedIds));
                    } catch (permError) {
                        console.error('Error guardando permisos del rol:', permError);
                        feedback.error('Rol actualizado pero error al guardar permisos');
                    }
                }

                feedback.success('Rol actualizado exitosamente');
                feedback.showNotification({ title: 'Rol actualizado', message: `El rol "${result.role.rName}" ha sido actualizado.`, variant: 'success' });
                navigate(`/roles/view/${id}`);
            } else {
                setError(result.error || 'Error al actualizar rol');
            }
        } catch (err: any) {
            console.error('Error actualizando rol:', err);
            setError(err?.response?.data?.message || 'Error inesperado al actualizar el rol');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async () => {
        if (hasChanges) {
            const confirmed = await feedback.confirm('Salir sin guardar', '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.');
            if (!confirmed) return;
        }
        navigate(`/roles/view/${id}`);
    };

    if (loadingData) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"><span className="visually-hidden">Cargando...</span></div>
                    <p className="text-muted">Cargando datos del rol...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.rName) {
        return (
            <div className="min-vh-100 bg-light">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-exclamation-triangle display-4 text-danger mb-4"></i>
                                    <h4 className="card-title text-danger mb-3">Error al Cargar Rol</h4>
                                    <p className="card-text text-muted mb-4">{error}</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/roles')}>
                                        <i className="bi bi-arrow-left me-2"></i>Volver a la Lista
                                    </button>
                                </div>
                            </div>
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
                                <h1 className="h3 fw-bold mb-1">Editar Rol</h1>
                                <p className="text-muted mb-0">Modifica la información y permisos del rol</p>
                            </div>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={handleCancel}>
                                <i className="bi bi-arrow-left"></i> Volver
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

                {hasPermission === false && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
                                <i className="bi bi-shield-x-fill me-2"></i>
                                <strong>Acceso Denegado</strong>
                                <p className="mb-0 mt-2">No tienes permisos para editar roles.</p>
                                <button type="button" className="btn-close" onClick={() => navigate('/roles')}></button>
                            </div>
                        </div>
                    </div>
                )}

                {hasPermission === true && (
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
                                                <input id="rName" type="text" className="form-control form-control-lg" value={formData.rName} onChange={e => onInputChange('rName', e.target.value)} required disabled={loading} minLength={3} maxLength={50} />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label htmlFor="rIsActive" className="form-label fw-semibold">Estado</label>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" id="rIsActive" checked={formData.rIsActive ?? true} onChange={e => onInputChange('rIsActive', e.target.checked)} disabled={loading} />
                                                    <label className="form-check-label" htmlFor="rIsActive">{formData.rIsActive ? 'Activo' : 'Inactivo'}</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label htmlFor="rIsAdmin" className="form-label fw-semibold">Rol Administrativo</label>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" id="rIsAdmin" checked={formData.rIsAdmin ?? false} onChange={e => onInputChange('rIsAdmin', e.target.checked)} disabled={loading} />
                                                    <label className="form-check-label" htmlFor="rIsAdmin">{formData.rIsAdmin ? 'Es rol administrativo' : 'No es rol administrativo'}</label>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label htmlFor="rRequires2FA" className="form-label fw-semibold">Requiere 2FA</label>
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" id="rRequires2FA" checked={formData.rRequires2FA ?? false} onChange={e => onInputChange('rRequires2FA', e.target.checked)} disabled={loading} />
                                                    <label className="form-check-label" htmlFor="rRequires2FA">{formData.rRequires2FA ? 'Requiere 2FA' : 'No requiere 2FA'}</label>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <label htmlFor="rDescription" className="form-label fw-semibold">Descripción</label>
                                                <textarea id="rDescription" className="form-control form-control-lg" value={formData.rDescription ?? ''} onChange={e => onInputChange('rDescription', e.target.value)} disabled={loading} rows={3} maxLength={255} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-header bg-white border-bottom py-3">
                                        <h5 className="card-title mb-0 fw-semibold">
                                            <i className="bi bi-shield-check me-2 text-primary"></i>Permisos del Rol
                                        </h5>
                                    </div>
                                    <div className="card-body p-4">
                                        <p className="text-muted small mb-3">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Los cambios se aplican en el servidor al guardar.
                                        </p>
                                        {permissionsLoading ? (
                                            <LoadingSpinner message="Cargando permisos del rol..." size="sm" />
                                        ) : Object.keys(groupedByModule).length === 0 ? (
                                            <AlertMessage type="warning" message="No hay permisos definidos en el sistema." />
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
                                                                    {perms.map(p => {
                                                                        const changed = permChanged(p.id);
                                                                        return (
                                                                            <div key={p.id} className="col-12 col-md-6 col-lg-3">
                                                                                <div className="form-check">
                                                                                    <input className="form-check-input" type="checkbox" id={`perm-${p.id}`}
                                                                                        checked={grantedIds.has(p.id)}
                                                                                        onChange={e => togglePermission(p.id, e.target.checked)}
                                                                                        disabled={loading || !p.pEnabled} />
                                                                                    <label className={`form-check-label text-capitalize ${changed ? 'fw-semibold text-success' : ''}`} htmlFor={`perm-${p.id}`}>
                                                                                        {p.pAction}
                                                                                        {changed && <i className="bi bi-pencil-square ms-1 small"></i>}
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {hasChanges && (
                                    <div className="card shadow-sm border-0 mb-4">
                                        <div className="card-body p-4">
                                            <div className="alert alert-warning border-0 bg-light mb-0">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                <strong>Atención:</strong> Tienes cambios sin guardar.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-4">
                                        <div className="d-flex flex-column flex-sm-row gap-3">
                                            <button type="submit" className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2" disabled={loading || !hasChanges}>
                                                {loading
                                                    ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...</>
                                                    : <><i className="bi bi-check-circle"></i> Guardar Cambios</>}
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={handleCancel} disabled={loading}>
                                                <i className="bi bi-x-circle me-2"></i>Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
}

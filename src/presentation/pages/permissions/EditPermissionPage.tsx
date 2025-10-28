import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { permissionEntityFlow } from '../../../infrastructure/flows/permission';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';
import type {  UpdatePermissionData } from '../../../types/permissionEntity';

// Opciones disponibles para módulos y acciones
const MODULE_OPTIONS = [
    { value: 'users', label: 'Usuarios' },
    { value: 'roles', label: 'Roles' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'virtualFiles', label: 'Fichas Virtuales' },
    { value: 'audits', label: 'Auditorías' },
    { value: 'programs', label: 'Programas' },
    { value: 'vaccines', label: 'Vacunas' },
    { value: 'subPrograms', label: 'Sub-programas' },
    { value: 'entranceExit', label: 'Entradas/Salidas' },
    { value: 'twoFactor', label: 'Autenticación 2FA' }
];

const ACTION_OPTIONS = [
    { value: 'view', label: 'Ver' },
    { value: 'create', label: 'Crear' },
    { value: 'edit', label: 'Editar' },
    { value: 'delete', label: 'Eliminar' }
];

interface PermissionFormData {
    name: string;
    description: string;
    module: string;
    action: string;
    enabled: boolean;
}

export default function EditPermissionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();
    const [formData, setFormData] = useState<PermissionFormData>({
        name: '',
        description: '',
        module: '',
        action: '',
        enabled: true
    });
    const [originalData, setOriginalData] = useState<PermissionFormData>({
        name: '',
        description: '',
        module: '',
        action: '',
        enabled: true
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const loadPermission = async () => {
            if (!id) {
                setError('ID de permiso no proporcionado');
                setLoadingData(false);
                return;
            }

            setLoadingData(true);
            setError('');

            try {
                const result = await permissionEntityFlow.getPermissionById(Number(id));

                if (result.success && result.permission) {
                    const permissionData = {
                        name: result.permission.name,
                        description: result.permission.description,
                        module: result.permission.module,
                        action: result.permission.action,
                        enabled: result.permission.enabled
                    };
                    setFormData(permissionData);
                    setOriginalData(permissionData);
                } else {
                    setError(result.error || 'Error al cargar permiso');
                }
            } catch (err) {
                console.error('Error cargando permiso:', err);
                setError('Error inesperado al cargar el permiso');
            } finally {
                setLoadingData(false);
            }
        };

        loadPermission();
    }, [id]);

    useEffect(() => {
        // Verificar si hay cambios
        const changes = JSON.stringify(formData) !== JSON.stringify(originalData);
        setHasChanges(changes);
    }, [formData, originalData]);

    function onInputChange(field: keyof PermissionFormData, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Por favor ingresa el nombre del permiso');
            return;
        }

        if (!formData.description.trim()) {
            setError('Por favor ingresa la descripción del permiso');
            return;
        }

        if (!formData.module.trim()) {
            setError('Por favor ingresa el módulo del permiso');
            return;
        }

        if (!formData.action.trim()) {
            setError('Por favor ingresa la acción del permiso');
            return;
        }

        if (formData.name.trim().length < 3) {
            setError('El nombre del permiso debe tener al menos 3 caracteres');
            return;
        }

        if (!hasChanges) {
            setError('No hay cambios para guardar');
            return;
        }

        setLoading(true);

        try {
            const updateData: UpdatePermissionData = {};
            if (formData.name !== originalData.name) updateData.name = formData.name;
            if (formData.description !== originalData.description) updateData.description = formData.description;
            if (formData.module !== originalData.module) updateData.module = formData.module;
            if (formData.action !== originalData.action) updateData.action = formData.action;
            if (formData.enabled !== originalData.enabled) updateData.enabled = formData.enabled;

            const result = await permissionEntityFlow.updatePermission(Number(id), updateData);

            if (result.success && result.permission) {
                feedback.success('Permiso actualizado exitosamente');
                feedback.showNotification({
                    title: 'Permiso actualizado',
                    message: 'El permiso ha sido actualizado exitosamente.',
                    variant: 'success'
                });
                navigate(`/permissions/view/${id}`);
            } else {
                setError(result.error || 'Error al actualizar permiso');
            }
        } catch (err) {
            console.error('Error actualizando permiso:', err);
            setError('Error inesperado al actualizar permiso');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = async () => {
        if (hasChanges) {
            const confirmed = await feedback.confirm(
                'Salir sin guardar',
                '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.'
            );
            if (!confirmed) return;
        }
        navigate(`/permissions/view/${id}`);
    };

    if (loadingData) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted">Cargando datos del permiso...</p>
                </div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="min-vh-100 bg-light">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-exclamation-triangle display-4 text-danger mb-4"></i>
                                    <h4 className="card-title text-danger mb-3">Error al Cargar Permiso</h4>
                                    <p className="card-text text-muted mb-4">{error}</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/permissions')}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Volver a la Lista
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
                                <h1 className="h3 fw-bold mb-1">Editar Permiso</h1>
                                <p className="text-muted mb-0">Modifica la información del permiso seleccionado</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={() => navigate(`/permissions/view/${id}`)}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Volver a la Vista
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
                        <div className="col-12">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-shield-check me-2 text-primary"></i>
                                        Información del Permiso
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="name" className="form-label fw-semibold">
                                                Nombre del Permiso <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.name}
                                                onChange={(e) => onInputChange('name', e.target.value)}
                                                placeholder="Ej: Ver Usuarios, Crear Roles"
                                                required
                                                disabled={loading}
                                                minLength={3}
                                                maxLength={100}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Nombre descriptivo del permiso (mínimo 3 caracteres)
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="module" className="form-label fw-semibold">
                                                Módulo <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="module"
                                                className="form-select form-select-lg"
                                                value={formData.module}
                                                onChange={(e) => onInputChange('module', e.target.value)}
                                                required
                                                disabled={loading}
                                            >
                                                <option value="">Selecciona un módulo</option>
                                                {MODULE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Módulo del sistema al que pertenece el permiso
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="action" className="form-label fw-semibold">
                                                Acción <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="action"
                                                className="form-select form-select-lg"
                                                value={formData.action}
                                                onChange={(e) => onInputChange('action', e.target.value)}
                                                required
                                                disabled={loading}
                                            >
                                                <option value="">Selecciona una acción</option>
                                                {ACTION_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Acción que permite el permiso
                                            </small>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="enabled" className="form-label fw-semibold">
                                                Estado
                                            </label>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="enabled"
                                                    checked={formData.enabled}
                                                    onChange={(e) => onInputChange('enabled', e.target.checked)}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label" htmlFor="enabled">
                                                    {formData.enabled ? 'Habilitado' : 'Deshabilitado'}
                                                </label>
                                            </div>
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Indica si el permiso está activo en el sistema
                                            </small>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="description" className="form-label fw-semibold">
                                                Descripción <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                id="description"
                                                className="form-control form-control-lg"
                                                value={formData.description}
                                                onChange={(e) => onInputChange('description', e.target.value)}
                                                placeholder="Describe qué permite este permiso..."
                                                required
                                                disabled={loading}
                                                rows={3}
                                                maxLength={255}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Descripción detallada del permiso y su propósito
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {hasChanges && (
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-body p-4">
                                        <div className="alert alert-info border-0 bg-light">
                                            <h6 className="alert-heading fw-semibold">
                                                <i className="bi bi-info-circle me-2"></i>
                                                Cambios Detectados
                                            </h6>
                                            <p className="mb-0">
                                                Se han detectado cambios en el formulario. Recuerda guardar los cambios antes de salir.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            disabled={loading || !hasChanges}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Guardando cambios...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle"></i>
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-x-circle"></i>
                                            Cancelar
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
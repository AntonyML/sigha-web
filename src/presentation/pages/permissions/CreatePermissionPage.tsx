import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permissionEntityFlow } from '../../../infrastructure/flows/permission';
import type { CreatePermissionData } from '../../../types/permissionEntity';

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

const defaultPermissionFormData: CreatePermissionData = {
    name: '',
    description: '',
    module: '',
    action: '',
    enabled: true
};

export default function CreatePermissionPage() {
    const [formData, setFormData] = useState<CreatePermissionData>(defaultPermissionFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    function onInputChange(field: keyof CreatePermissionData, value: string | boolean) {
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

        setLoading(true);

        try {
            const result = await permissionEntityFlow.createPermission(formData);

            if (result.success && result.permission) {
                alert('Permiso creado exitosamente');
                navigate('/permissions');
            } else {
                setError(result.error || 'Error al crear permiso');
            }
        } catch (err) {
            console.error('Error creando permiso:', err);
            setError('Error inesperado al crear permiso');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 bg-light">
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h1 className="h3 fw-bold mb-1">Crear Nuevo Permiso</h1>
                                <p className="text-muted mb-0">Define un nuevo permiso para el sistema</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={() => navigate('/permissions')}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Volver a la lista
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
                                        <i className="bi bi-shield-plus me-2 text-primary"></i>
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

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Creando permiso...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle"></i>
                                                    Crear Permiso
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => navigate('/permissions')}
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
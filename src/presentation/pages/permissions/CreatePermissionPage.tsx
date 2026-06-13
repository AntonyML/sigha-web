import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { permissionApiService } from '../../../services/permissionApiService';
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications';

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
    pName: string;
    pDescription: string;
    pModule: string;
    pAction: string;
    pEnabled: boolean;
}

const defaultFormData: PermissionFormData = {
    pName: '',
    pDescription: '',
    pModule: '',
    pAction: '',
    pEnabled: true
};

export default function CreatePermissionPage() {
    const [formData, setFormData] = useState<PermissionFormData>(defaultFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const feedback = useFeedbackWithNotifications();

    function onInputChange(field: keyof PermissionFormData, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!formData.pName.trim()) { setError('Por favor ingresa el nombre del permiso'); return; }
        if (!formData.pDescription.trim()) { setError('Por favor ingresa la descripción del permiso'); return; }
        if (!formData.pModule.trim()) { setError('Por favor ingresa el módulo del permiso'); return; }
        if (!formData.pAction.trim()) { setError('Por favor ingresa la acción del permiso'); return; }
        if (formData.pName.trim().length < 3) { setError('El nombre del permiso debe tener al menos 3 caracteres'); return; }

        setLoading(true);

        try {
            const created = await permissionApiService.create({
                pName: formData.pName.trim(),
                pDescription: formData.pDescription.trim(),
                pModule: formData.pModule,
                pAction: formData.pAction,
                pEnabled: formData.pEnabled,
            });

            feedback.success('Permiso creado exitosamente');
            feedback.showNotification({
                title: 'Permiso creado',
                message: `El permiso "${created.pName}" ha sido creado exitosamente.`,
                variant: 'success'
            });
            navigate('/permissions');
        } catch (err: any) {
            console.error('Error creando permiso:', err);
            setError(err?.response?.data?.message || err?.message || 'Error al crear permiso en el servidor');
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
                                            <label htmlFor="pName" className="form-label fw-semibold">
                                                Nombre del Permiso <span className="text-danger">*</span>
                                            </label>
                                            <input id="pName" type="text" className="form-control form-control-lg"
                                                value={formData.pName} onChange={e => onInputChange('pName', e.target.value)}
                                                placeholder="Ej: Ver Usuarios, Crear Roles" required disabled={loading} minLength={3} maxLength={100} />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="pModule" className="form-label fw-semibold">
                                                Módulo <span className="text-danger">*</span>
                                            </label>
                                            <select id="pModule" className="form-select form-select-lg"
                                                value={formData.pModule} onChange={e => onInputChange('pModule', e.target.value)}
                                                required disabled={loading}>
                                                <option value="">Selecciona un módulo</option>
                                                {MODULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="pAction" className="form-label fw-semibold">
                                                Acción <span className="text-danger">*</span>
                                            </label>
                                            <select id="pAction" className="form-select form-select-lg"
                                                value={formData.pAction} onChange={e => onInputChange('pAction', e.target.value)}
                                                required disabled={loading}>
                                                <option value="">Selecciona una acción</option>
                                                {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="pEnabled" className="form-label fw-semibold">Estado</label>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" id="pEnabled"
                                                    checked={formData.pEnabled} onChange={e => onInputChange('pEnabled', e.target.checked)} disabled={loading} />
                                                <label className="form-check-label" htmlFor="pEnabled">
                                                    {formData.pEnabled ? 'Habilitado' : 'Deshabilitado'}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="pDescription" className="form-label fw-semibold">
                                                Descripción <span className="text-danger">*</span>
                                            </label>
                                            <textarea id="pDescription" className="form-control form-control-lg"
                                                value={formData.pDescription} onChange={e => onInputChange('pDescription', e.target.value)}
                                                placeholder="Describe qué permite este permiso..." required disabled={loading} rows={3} maxLength={255} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-sm-row gap-3">
                                        <button type="submit" className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                                            {loading
                                                ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creando permiso...</>
                                                : <><i className="bi bi-check-circle"></i> Crear Permiso</>}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={() => navigate('/permissions')} disabled={loading}>
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

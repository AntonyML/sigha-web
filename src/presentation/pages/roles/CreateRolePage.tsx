import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RoleFormData {
    rName: string;
}

const defaultRoleFormData: RoleFormData = {
    rName: ''
};

export default function CreateRolePage() {
    const [formData, setFormData] = useState<RoleFormData>(defaultRoleFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    function onInputChange(field: keyof RoleFormData, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (!formData.rName.trim()) {
            setError('Por favor ingresa el nombre del rol');
            return;
        }

        if (formData.rName.trim().length < 3) {
            setError('El nombre del rol debe tener al menos 3 caracteres');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implementar creación de rol cuando esté disponible en el backend
            // const result = await roleFlow.createRole({ rName: formData.rName });

            // Por ahora, mostrar mensaje de que la funcionalidad está en desarrollo
            alert('Funcionalidad de creación de roles estará disponible próximamente.\n\nRol que se intentaría crear: ' + formData.rName);

            // Una vez implementado, descomentar:
            // if (result.success && result.role) {
            //     alert('Rol creado exitosamente');
            //     navigate('/roles');
            // } else {
            //     setError(result.error || 'Error al crear rol');
            // }

            // Navegar de vuelta a la lista por ahora
            navigate('/roles');
        } catch (err) {
            console.error('Error creando rol:', err);
            setError('Error inesperado al crear rol');
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
                                <h1 className="h3 fw-bold mb-1">Crear Nuevo Rol</h1>
                                <p className="text-muted mb-0">Define un nuevo rol para el sistema</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={() => navigate('/roles')}
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
                                        Información del Rol
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <label htmlFor="rName" className="form-label fw-semibold">
                                                Nombre del Rol <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="rName"
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.rName}
                                                onChange={(e) => onInputChange('rName', e.target.value)}
                                                placeholder="Ej: Administrador, Enfermera, Doctor"
                                                required
                                                disabled={loading}
                                                minLength={3}
                                                maxLength={50}
                                            />
                                            <small className="text-muted d-block mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                El nombre debe ser único y descriptivo (mínimo 3 caracteres)
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-white border-bottom py-3">
                                    <h5 className="card-title mb-0 fw-semibold">
                                        <i className="bi bi-info-circle me-2 text-warning"></i>
                                        Información Importante
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="alert alert-info border-0 bg-light">
                                        <h6 className="alert-heading fw-semibold">
                                            <i className="bi bi-lightbulb me-2"></i>
                                            Funcionalidad en Desarrollo
                                        </h6>
                                        <p className="mb-2">
                                            La creación de roles es una funcionalidad avanzada que requiere configuración
                                            cuidadosa de permisos y validaciones en el backend.
                                        </p>
                                        <hr />
                                        <p className="mb-0 small">
                                            <strong>Próximos pasos:</strong> Una vez implementado el endpoint en el backend,
                                            esta página permitirá crear roles con permisos específicos asignados.
                                        </p>
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
                                                    Creando rol...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle"></i>
                                                    Crear Rol
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center gap-2"
                                            onClick={() => navigate('/roles')}
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
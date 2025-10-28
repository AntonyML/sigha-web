import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { UserRole } from '../../../types/user';

interface RoleFormData {
    rName: string;
}

export default function EditRolePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RoleFormData>({ rName: '' });
    const [originalData, setOriginalData] = useState<RoleFormData>({ rName: '' });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const loadRole = async () => {
            if (!id) {
                setError('ID de rol no proporcionado');
                setLoadingData(false);
                return;
            }

            setLoadingData(true);
            setError('');

            try {
                // TODO: Implementar obtención de rol por ID cuando esté disponible en el backend
                // const result = await roleFlow.getRoleById(Number(id));

                // Por ahora, simulamos la carga de un rol
                const mockRole: UserRole = {
                    id: Number(id),
                    rName: `Rol ${id}` // Esto sería el nombre real del rol
                };

                const roleData = { rName: mockRole.rName };
                setFormData(roleData);
                setOriginalData(roleData);

                // Una vez implementado, descomentar:
                // if (result.success && result.role) {
                //     const roleData = { rName: result.role.rName };
                //     setFormData(roleData);
                //     setOriginalData(roleData);
                // } else {
                //     setError(result.error || 'Error al cargar rol');
                // }
            } catch (err) {
                console.error('Error cargando rol:', err);
                setError('Error inesperado al cargar el rol');
            } finally {
                setLoadingData(false);
            }
        };

        loadRole();
    }, [id]);

    useEffect(() => {
        // Verificar si hay cambios
        const changes = JSON.stringify(formData) !== JSON.stringify(originalData);
        setHasChanges(changes);
    }, [formData, originalData]);

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

        if (!hasChanges) {
            setError('No hay cambios para guardar');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implementar actualización de rol cuando esté disponible en el backend
            // const result = await roleFlow.updateRole(Number(id), { rName: formData.rName });

            // Por ahora, mostrar mensaje de que la funcionalidad está en desarrollo
            alert(`Funcionalidad de edición de roles estará disponible próximamente.\n\nRol que se intentaría actualizar: ${originalData.rName} → ${formData.rName}`);

            // Una vez implementado, descomentar:
            // if (result.success && result.role) {
            //     alert('Rol actualizado exitosamente');
            //     navigate(`/roles/view/${id}`);
            // } else {
            //     setError(result.error || 'Error al actualizar rol');
            // }

            // Navegar de vuelta a la vista por ahora
            navigate(`/roles/view/${id}`);
        } catch (err) {
            console.error('Error actualizando rol:', err);
            setError('Error inesperado al actualizar rol');
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        if (hasChanges) {
            const confirmLeave = window.confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.');
            if (!confirmLeave) return;
        }
        navigate(`/roles/view/${id}`);
    };

    if (loadingData) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
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
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/roles')}
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
                                <h1 className="h3 fw-bold mb-1">Editar Rol</h1>
                                <p className="text-muted mb-0">Modifica la información del rol seleccionado</p>
                            </div>
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={handleCancel}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Volver
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
                                        <i className="bi bi-info-circle me-2 text-info"></i>
                                        Información de Cambios
                                    </h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Valor Original</small>
                                                <span className="fw-semibold text-primary">{originalData.rName}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded p-3 bg-light">
                                                <small className="text-muted d-block fw-semibold">Valor Nuevo</small>
                                                <span className={`fw-semibold ${hasChanges ? 'text-success' : 'text-muted'}`}>
                                                    {formData.rName || 'Sin cambios'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {hasChanges && (
                                        <div className="alert alert-warning border-0 bg-light mt-3">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            <strong>Atención:</strong> Has realizado cambios que no han sido guardados.
                                        </div>
                                    )}
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
                                            <i className="bi bi-tools me-2"></i>
                                            Funcionalidad en Desarrollo
                                        </h6>
                                        <p className="mb-2">
                                            La edición de roles es una funcionalidad avanzada que requiere validaciones
                                            de permisos y control de concurrencia en el backend.
                                        </p>
                                        <hr />
                                        <p className="mb-0 small">
                                            <strong>Próximos pasos:</strong> Una vez implementado el endpoint en el backend,
                                            esta página permitirá editar roles con validación de conflictos y auditoría.
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
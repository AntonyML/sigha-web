import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { permissionApiService } from '../../../services/permissionApiService';

export default function ViewPermissionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [permission, setPermission] = useState<Awaited<ReturnType<typeof permissionApiService.getById>> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadPermission = async () => {
            if (!id) { setError('ID de permiso no proporcionado'); setLoading(false); return; }
            setLoading(true); setError('');
            try {
                const p = await permissionApiService.getById(Number(id));
                setPermission(p);
            } catch (err: any) {
                console.error('Error cargando permiso:', err);
                setError(err?.response?.data?.message || 'Error al cargar permiso desde el servidor');
            } finally {
                setLoading(false);
            }
        };
        loadPermission();
    }, [id]);

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"><span className="visually-hidden">Cargando...</span></div>
                    <p className="text-muted">Cargando detalles del permiso...</p>
                </div>
            </div>
        );
    }

    if (error) {
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
                                    <button className="btn btn-primary" onClick={() => navigate('/permissions')}>
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

    if (!permission) {
        return (
            <div className="min-vh-100 bg-light">
                <div className="container-fluid py-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-shield-x display-4 text-muted mb-4"></i>
                                    <h4 className="card-title text-muted mb-3">Permiso No Encontrado</h4>
                                    <p className="card-text text-muted mb-4">El permiso que buscas no existe o ha sido eliminado.</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/permissions')}>
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
                                <h1 className="h3 fw-bold mb-1">Detalles del Permiso</h1>
                                <p className="text-muted mb-0">Información completa del permiso seleccionado</p>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => navigate(`/permissions/edit/${id}`)}>
                                    <i className="bi bi-pencil"></i> Editar Permiso
                                </button>
                                <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => navigate('/permissions')}>
                                    <i className="bi bi-arrow-left"></i> Volver a la Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-lg-8">
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="bi bi-shield-check me-2 text-primary"></i>Información del Permiso
                                </h5>
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <div className={`text-white rounded-circle d-flex align-items-center justify-content-center me-4 ${permission.pEnabled ? 'bg-success' : 'bg-danger'}`} style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-shield-check fs-1"></i>
                                    </div>
                                    <div>
                                        <h3 className="mb-1 fw-bold">{permission.pName}</h3>
                                        <p className="text-muted mb-2">{permission.pDescription}</p>
                                        <span className="badge bg-primary fs-6 px-3 py-2 me-2">ID: #{permission.id}</span>
                                        <span className={`badge fs-6 px-3 py-2 ${permission.pEnabled ? 'bg-success' : 'bg-danger'}`}>
                                            {permission.pEnabled ? 'Habilitado' : 'Deshabilitado'}
                                        </span>
                                    </div>
                                </div>

                                <div className="border rounded p-3 bg-light">
                                    <h6 className="fw-semibold mb-3">
                                        <i className="bi bi-info-circle me-2 text-info"></i>Información General
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6"><small className="text-muted d-block">ID del Permiso</small><span className="fw-semibold">{permission.id}</span></div>
                                        <div className="col-md-6"><small className="text-muted d-block">Nombre</small><span className="fw-semibold">{permission.pName}</span></div>
                                        <div className="col-md-6"><small className="text-muted d-block">Módulo</small><span className="badge bg-info">{permission.pModule}</span></div>
                                        <div className="col-md-6"><small className="text-muted d-block">Acción</small><span className="badge bg-warning">{permission.pAction}</span></div>
                                        <div className="col-md-6"><small className="text-muted d-block">Estado</small><span className={`fw-semibold ${permission.pEnabled ? 'text-success' : 'text-danger'}`}>{permission.pEnabled ? 'Habilitado' : 'Deshabilitado'}</span></div>
                                        {permission.createdAt && (
                                            <div className="col-md-6"><small className="text-muted d-block">Fecha de Creación</small><span className="fw-semibold">{new Date(permission.createdAt).toLocaleDateString()}</span></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4">
                                <h6 className="fw-semibold mb-3">
                                    <i className="bi bi-file-text me-2 text-secondary"></i>Descripción Detallada
                                </h6>
                                <p className="mb-0">{permission.pDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

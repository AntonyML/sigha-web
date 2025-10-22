import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { entranceExitService } from '../../../services/entranceExitService';
import type { EntranceExitResponse } from '../../../types/entranceExit';
import type { EntranceExitSearchParams } from '../../../types/entranceExitApi';

export default function EntranceExitHistory() {
    const [records, setRecords] = useState<EntranceExitResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const filter = searchParams.get('filter') || 'all';
    const [filters, setFilters] = useState<EntranceExitSearchParams>({
        eeClose: true,
        page: 1,
        limit: 100
    });

    useEffect(() => {
        let newFilters = { ...filters, eeClose: true };

        if (filter === 'entrances') {
            newFilters.eeAccessType = 'entrance';
        } else if (filter === 'exits') {
            newFilters.eeAccessType = 'exit';
        } else {
            delete newFilters.eeAccessType;
        }

        setFilters(newFilters);
    }, [filter]);

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await entranceExitService.searchEntranceExits(filters);
            setRecords(response.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('es-ES');
    };

    const getFullName = (item: EntranceExitResponse) => {
        const parts = [item.eeName, item.eeFLastName, item.eeSLastName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Sin nombre';
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'employee': 'Empleado',
            'older adult': 'Adulto Mayor',
            'visitor': 'Visitante',
            'volunteer': 'Voluntario',
            'vehicle': 'Vehículo',
            'other': 'Otro'
        };
        return labels[type] || type;
    };

    const getTitle = () => {
        switch (filter) {
            case 'entrances': return 'Historial de Entradas-Salidas';
            case 'exits': return 'Historial de Salidas-Entradas';
            default: return 'Historial Completo de Entradas y Salidas';
        }
    };

    const handleFilterChange = (newFilter: string) => {
        setSearchParams({ filter: newFilter });
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    {getTitle()}
                </h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/entrance-exit')}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Regresar
                </button>
            </div>
            <div className="mb-4">
                <div className="card">
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-auto">
                                <label className="form-label mb-0 me-3">Filtrar por:</label>
                            </div>
                            <div className="col-md-auto">
                                <div className="btn-group" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => handleFilterChange('all')}
                                    >
                                        <i className="bi bi-list me-2"></i>
                                        Todos los Registros
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-auto ms-auto">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={loadData}
                                    title="Actualizar datos"
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Tipo</th>
                                    <th>Acceso</th>
                                    <th>Identificación</th>
                                    <th>Nombre Completo</th>
                                    <th>Fecha/Hora Entrada</th>
                                    <th>Fecha/Hora Salida</th>
                                    <th>Estado</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-muted py-5">
                                            <i className="bi bi-inbox display-6 d-block mb-3"></i>
                                            <h5>No hay registros para mostrar</h5>
                                            <p className="mb-0">No se encontraron registros con los filtros actuales.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((item) => (
                                        <tr key={item.id}>
                                            <td className="fw-bold text-primary">#{item.id}</td>
                                            <td>
                                                <span className="badge bg-secondary">{getTypeLabel(item.eeType)}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${item.eeAccessType === 'entrance' ? 'bg-success' : 'bg-warning'}`}>
                                                    <i className={`bi ${item.eeAccessType === 'entrance' ? 'bi-box-arrow-in-right' : 'bi-box-arrow-right'} me-1`}></i>
                                                    {item.eeAccessType === 'entrance' ? 'Entrada' : 'Salida'}
                                                </span>
                                            </td>
                                            <td className="fw-medium">{item.eeIdentification || 'N/A'}</td>
                                            <td>{getFullName(item)}</td>
                                            <td className="text-nowrap">{formatDateTime(item.eeDatetimeEntrance)}</td>
                                            <td className="text-nowrap">{formatDateTime(item.eeDatetimeExit)}</td>
                                            <td>
                                                <span className={`badge ${item.eeClose ? 'bg-success' : 'bg-danger'}`}>
                                                    <i className={`bi ${item.eeClose ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                                                    {item.eeClose ? 'Finalizado' : 'Activo'}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {item.eeObservations || 'Sin observaciones'}
                                                </small>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {records.length > 0 && (
                    <div className="card-footer bg-light">
                        <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Mostrando {records.length} registro(s) finalizado(s)
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}
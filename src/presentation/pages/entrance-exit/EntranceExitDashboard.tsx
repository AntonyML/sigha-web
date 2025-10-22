import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entranceExitService } from '../../../services/entranceExitService';
import type { EntranceExitResponse } from '../../../types/entranceExit';

export default function EntranceExitDashboard() {
  const [activeEntrances, setActiveEntrances] = useState<EntranceExitResponse[]>([]);
  const [activeExits, setActiveExits] = useState<EntranceExitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entrances, exits] = await Promise.all([
        entranceExitService.getActiveEntrances(),
        entranceExitService.getActiveExits()
      ]);
      setActiveEntrances(Array.isArray(entrances) ? entrances : []);
      setActiveExits(Array.isArray(exits) ? exits : []);
    } catch (error) {
      setActiveEntrances([]);
      setActiveExits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeEntrance = async (id: number) => {
    try {
      console.log('🔄 Finalizing entrance record:', id);
      await entranceExitService.finalizeEntranceRecord(id);
      console.log('✅ Entrance record finalized successfully');
      await loadData(); // Recargar datos
    } catch (error) {
      console.error('❌ Error finalizing entrance record:', error);
    }
  };

  const handleFinalizeExit = async (id: number) => {
    try {
      console.log('🔄 Finalizing exit record:', id);
      await entranceExitService.finalizeExitRecord(id);
      console.log('✅ Exit record finalized successfully');
      await loadData(); // Recargar datos
    } catch (error) {
      console.error('❌ Error finalizing exit record:', error);
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
      <div className="row">
        <div className="col-md-3 col-lg-2">
          <div className="d-grid gap-2">
            <h5 className="mb-3 text-dark">
              Control de Acceso
            </h5>
            
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/entrance-exit/register?type=entrance')}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Registrar Entrada-Salida
            </button>
            
            <button 
              className="btn btn-success"
              onClick={() => navigate('/entrance-exit/register?type=exit')}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Registrar Salida-Entrada
            </button>
            
            <hr className="my-3" />
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/entrance-exit/history?filter=entrances')}
            >
              <i className="bi bi-list-ul me-2"></i>
              Ver registros pasados
            </button>
          </div>
        </div>
        <div className="col-md-9 col-lg-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Control de Entradas y Salidas</h2>
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-outline-secondary mt-3"
                onClick={() => navigate('/main-menu')}>
                <i className="bi bi-house me-2"></i>
                Menú Principal
              </button>
            <button className="btn btn-outline-secondary mt-3" onClick={loadData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
            </div>
          </div>
          <div className="mb-5">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="card-title mb-0">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Registros de Entrada-Salida Activos ({activeEntrances.length})
                </h4>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Tipo</th>
                        <th>Identificación</th>
                        <th>Nombre Completo</th>
                        <th>Fecha/Hora Entrada</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEntrances.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            <i className="bi bi-inbox display-6 d-block mb-2"></i>
                            No hay registros de entrada activos
                          </td>
                        </tr>
                      ) : (
                        activeEntrances.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className="badge bg-primary">{getTypeLabel(item.eeType)}</span>
                            </td>
                            <td className="fw-medium">{item.eeIdentification || 'N/A'}</td>
                            <td>{getFullName(item)}</td>
                            <td className="text-nowrap">{formatDateTime(item.eeDatetimeEntrance)}</td>
                            <td>{item.eeObservations || 'Sin observaciones'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleFinalizeEntrance(item.id)}
                                title="Finalizar registro de entrada"
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Finalizar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="card">
              <div className="card-header bg-success text-white">
                <h4 className="card-title mb-0">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Registros de Salida-Entrada Activos ({activeExits.length})
                </h4>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Tipo</th>
                        <th>Identificación</th>
                        <th>Nombre Completo</th>
                        <th>Fecha/Hora Salida</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeExits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            <i className="bi bi-inbox display-6 d-block mb-2"></i>
                            No hay registros de salida activos
                          </td>
                        </tr>
                      ) : (
                        activeExits.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className="badge bg-success">{getTypeLabel(item.eeType)}</span>
                            </td>
                            <td className="fw-medium">{item.eeIdentification || 'N/A'}</td>
                            <td>{getFullName(item)}</td>
                            <td className="text-nowrap">{formatDateTime(item.eeDatetimeExit)}</td>
                            <td>{item.eeObservations || 'Sin observaciones'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleFinalizeExit(item.id)}
                                title="Finalizar registro de salida"
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Finalizar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
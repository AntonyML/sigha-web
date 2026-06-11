import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { systemAuditService } from '../../../services/systemAuditService';
import type { SystemHealthResponse, SystemMetrics, PerformanceReport } from '../../../services/systemAuditService';

export default function SystemHealthPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [healthData, metricsData, perfData] = await Promise.allSettled([
        systemAuditService.performHealthCheck(),
        systemAuditService.getSystemMetrics(),
        systemAuditService.getPerformanceMetrics(),
      ]);

      if (healthData.status === 'fulfilled') setHealth(healthData.value);
      if (metricsData.status === 'fulfilled') setMetrics(metricsData.value);
      if (perfData.status === 'fulfilled') setPerformance(perfData.value);

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading system health:', err);
      setError('Error al cargar el estado del sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusColor = (status: string) => {
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warning';
    return 'danger';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-cpu me-2 text-primary"></i>
          Estado del Sistema
        </h2>
        <div className="d-flex gap-2 align-items-center">
          <small className="text-muted">Actualizado: {lastRefresh.toLocaleTimeString('es-ES')}</small>
          <button className="btn btn-outline-primary" onClick={loadData} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
          </button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/audits')}>
            <i className="bi bi-arrow-left me-2"></i>Regresar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error} — Algunos datos pueden no estar disponibles.
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Consultando estado del sistema...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Estado General */}
          {health && (
            <div className="col-12">
              <div className={`card shadow-sm border-start border-4 border-${statusColor(health.status)}`}>
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className={`rounded-circle bg-${statusColor(health.status)} bg-opacity-10 d-flex align-items-center justify-content-center`}
                      style={{ width: '60px', height: '60px' }}>
                      <i className={`bi bi-${health.status === 'healthy' ? 'check-circle' : health.status === 'warning' ? 'exclamation-triangle' : 'x-circle'} fs-4 text-${statusColor(health.status)}`}></i>
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">Estado General del Sistema</h5>
                      <span className={`badge bg-${statusColor(health.status)} fs-6`}>
                        {health.status === 'healthy' ? 'Saludable' : health.status === 'warning' ? 'Advertencia' : 'Crítico'}
                      </span>
                    </div>
                  </div>
                  {health.issues && health.issues.length > 0 && (
                    <div className="mt-3">
                      {health.issues.map((w, i) => (
                        <div key={i} className="alert alert-warning py-1 mb-1"><i className="bi bi-exclamation-triangle me-2"></i>{w}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Métricas del Sistema */}
          {metrics && (
            <>
              <div className="col-md-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-memory fs-1 text-info d-block mb-2"></i>
                    <h6 className="fw-bold">Memoria RAM</h6>
                    <div className="progress mb-2" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${((metrics.heapUsed / metrics.heapTotal) * 100) > 80 ? 'bg-danger' : ((metrics.heapUsed / metrics.heapTotal) * 100) > 60 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${(metrics.heapUsed / metrics.heapTotal) * 100}%` }}
                      />
                    </div>
                    <p className="text-muted mb-0">
                      {metrics.heapUsed.toFixed(1)} MB / {metrics.heapTotal.toFixed(1)} MB
                      <br />
                      <strong>{((metrics.heapUsed / metrics.heapTotal) * 100).toFixed(1)}% utilizado</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-cpu fs-1 text-warning d-block mb-2"></i>
                    <h6 className="fw-bold">CPU</h6>
                    <div className="progress mb-2" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${metrics.cpuUsage > 80 ? 'bg-danger' : metrics.cpuUsage > 60 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${Math.min(metrics.cpuUsage, 100)}%` }}
                      />
                    </div>
                    <p className="text-muted mb-0">
                      <strong>{metrics.cpuUsage.toFixed(1)} seg CPU</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-clock-history fs-1 text-success d-block mb-2"></i>
                    <h6 className="fw-bold">Uptime</h6>
                    <p className="text-muted mb-1">
                      <strong className="fs-5 text-success">{formatUptime(metrics.uptime)}</strong>
                    </p>
                    <p className="text-muted small mb-0">
                      Memoria libre: <span className="badge bg-info">{metrics.freeMemory.toFixed(0)} MB</span>
                    </p>
                    {metrics.loadAverage && metrics.loadAverage.length > 0 && (
                      <p className="text-muted small mb-0">{metrics.loadAverage[0].toFixed(2)} load avg</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Métricas de Rendimiento */}
          {performance && (
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header fw-bold">
                  <i className="bi bi-speedometer2 me-2"></i>Métricas de Rendimiento
                </div>
                <div className="card-body">
                  <div className="row g-3 text-center">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <h3 className="text-primary fw-bold">{performance.summary.averageResponseTime.toFixed(0)}ms</h3>
                        <small className="text-muted">Tiempo de Respuesta Promedio</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <h3 className="text-success fw-bold">{performance.summary.totalRequests}</h3>
                        <small className="text-muted">Solicitudes Totales (24h)</small>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded">
                        <h3 className={`fw-bold ${performance.summary.errorRate > 5 ? 'text-danger' : 'text-warning'}`}>
                          {performance.summary.errorRate.toFixed(2)}%
                        </h3>
                        <small className="text-muted">Tasa de Error</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!health && !metrics && !performance && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
              No se pudieron cargar los datos del sistema. Verifique la conexión con el servidor.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

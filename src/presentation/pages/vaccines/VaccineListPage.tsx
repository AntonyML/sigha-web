import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vaccine } from '../../../types/vaccine';
import { vaccineService } from '../../../services/vaccineService';
import { useFeedbackWithNotifications } from '../../../presentation/hooks/useFeedbackWithNotifications';

export default function VaccineListPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const feedback = useFeedbackWithNotifications();

  useEffect(() => {
    loadVaccines();
  }, []);

  async function loadVaccines() {
    try {
      setLoading(true);
      const data = await vaccineService.getAllVaccines();
      setVaccines(data);
    } catch (error) {
      console.error(' Error cargando vacunaaaaaas:', error);
      feedback.error('Error al cargar las vacunas', 'Error de carga');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = await feedback.confirm(
      '¿Está seguro de que desea eliminar esta vacuna?',
      'Esta acción no se puede deshacer.'
    );

    if (confirmed) {
      try {
        await vaccineService.deleteVaccine(id);
        await loadVaccines();
        feedback.success('Vacuna eliminada exitosamente');
        feedback.showNotification({
          title: 'Vacuna eliminada',
          message: 'La vacuna ha sido eliminada del sistema',
          variant: 'success',
          icon: 'bi-check-circle-fill'
        });
      } catch (error) {
        console.error('❌ Error eliminando vacuna:', error);
        feedback.error('Error al eliminar la vacuna', 'Error de eliminación');
      }
    }
  }

  const filteredVaccines = vaccines.filter(vaccine =>
    vaccine.vName && vaccine.vName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-shield-plus me-2"></i>
          Gestión de Vacunas
        </h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/vaccines/create')}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nueva Vacuna
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/main-menu')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Menú Principal
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">Lista de Vacunas</h5>
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar vacunas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : filteredVaccines.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="mt-3 text-muted">
                {searchTerm ? 'No se encontraron vacunas que coincidan con la búsqueda' : 'No hay vacunas registradas'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nombre de la Vacuna</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVaccines.map((vaccine) => (
                    <tr key={vaccine.id}>
                      <td>
                        <span className="badge bg-secondary">{vaccine.id}</span>
                      </td>
                      <td>
                        <strong>{vaccine.vName}</strong>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => navigate(`/vaccines/edit/${vaccine.id}`)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(vaccine.id!)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-muted small">
        Total: {filteredVaccines.length} vacuna(s)
      </div>
    </div>
  );
}
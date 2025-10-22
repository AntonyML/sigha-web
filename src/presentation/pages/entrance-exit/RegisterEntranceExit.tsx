import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { entranceExitService } from '../../../services/entranceExitService';
import { defaultEntranceExitForm, type AccessType, type EntranceExitApiPayload, type EntranceExitForm, type EntranceExitType } from '../../../types/entranceExit';

export default function RegisterEntranceExit() {
  const [formData, setFormData] = useState<EntranceExitForm>(defaultEntranceExitForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessType = searchParams.get('type') as AccessType || 'entrance';

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      accessType: accessType,
      datetime: now
    }));
  }, [accessType]);

  const handleInputChange = (field: keyof EntranceExitForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof EntranceExitForm, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const transformToApiPayload = (form: EntranceExitForm): EntranceExitApiPayload => {
    return {
      eeType: form.type,
      eeAccessType: form.accessType,
      eeIdentification: form.identification || undefined,
      eeName: form.name || undefined,
      eeFLastName: form.firstLastName || undefined,
      eeSLastName: form.secondLastName || undefined,
      eeDatetimeEntrance: form.accessType === 'entrance' ? form.datetime : undefined,
      eeDatetimeExit: form.accessType === 'exit' ? form.datetime : undefined,
      eeClose: form.close,
      eeObservations: form.observations || undefined
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiPayload = transformToApiPayload(formData);
      console.log('Payload a enviar:', JSON.stringify(apiPayload, null, 2));
      
      const response = await entranceExitService.createEntranceExit(apiPayload);
      console.log('Respuesta del servidor:', response);
      
      navigate('/entrance-exit');
    } catch (error) {
      console.error('Error creando registro:', error);
      console.error('Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        payload: transformToApiPayload(formData)
      });
    } finally {
      setLoading(false);
    }
  };

  const typeOptions: { value: EntranceExitType; label: string }[] = [
    { value: 'employee', label: 'Empleado' },
    { value: 'older adult', label: 'Adulto Mayor' },
    { value: 'visitor', label: 'Visitante' },
    { value: 'volunteer', label: 'Voluntario' },
    { value: 'vehicle', label: 'Vehículo' },
    { value: 'other', label: 'Otro' }
  ];

  const getTitle = () => {
    return accessType === 'entrance' ? 'Registrar Entrada-Salida' : 'Registrar Salida-Entrada';
  };

  const getDateTimeLabel = () => {
    return accessType === 'entrance' ? 'Fecha y Hora de Entrada' : 'Fecha y Hora de Salida';
  };

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            {getTitle()}
          </h3>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/entrance-exit')} >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <label htmlFor="type" className="form-label">Tipo de Persona/Vehículo *</label>
            <select
              id="type"
              className="form-select"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              required
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="identification" className="form-label">Identificación</label>
            <input
              id="identification"
              type="text"
              className="form-control"
              value={formData.identification}
              onChange={(e) => handleInputChange('identification', e.target.value)}
              placeholder="Número de identificación"
            />
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre"
            />
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="firstLastName" className="form-label">Primer Apellido</label>
            <input
              id="firstLastName"
              type="text"
              className="form-control"
              value={formData.firstLastName}
              onChange={(e) => handleInputChange('firstLastName', e.target.value)}
              placeholder="Primer apellido"
            />
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="secondLastName" className="form-label">Segundo Apellido</label>
            <input
              id="secondLastName"
              type="text"
              className="form-control"
              value={formData.secondLastName}
              onChange={(e) => handleInputChange('secondLastName', e.target.value)}
              placeholder="Segundo apellido"
            />
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <label htmlFor="datetime" className="form-label">{getDateTimeLabel()} *</label>
            <input
              id="datetime"
              type="datetime-local"
              className="form-control"
              value={formData.datetime}
              onChange={(e) => handleInputChange('datetime', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="observations" className="form-label">Observaciones</label>
          <textarea
            id="observations"
            className="form-control"
            rows={4}
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            placeholder="Observaciones adicionales (opcional)"
          />
        </div>

        <div className="mb-4">
          <div className="form-check">
            <input
              id="close"
              type="checkbox"
              className="form-check-input"
              checked={formData.close}
              onChange={(e) => handleCheckboxChange('close', e.target.checked)}
            />
            <label htmlFor="close" className="form-check-label">
              Cerrar registro automáticamente
            </label>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Guardar Registro
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/entrance-exit')}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import EntranceExitNav from './EntranceExitNav';
import { useCedulaLookup } from '../../hooks/useCedulaLookup';

import { entranceExitService } from '../../../services/entranceExitService';
import { defaultEntranceExitForm, type AccessType, type EntranceExitApiPayload, type EntranceExitForm, type EntranceExitType } from '../../../types/entranceExit';

interface ValidationErrors {
  type?: string;
  identification?: string;
  name?: string;
  firstLastName?: string;
  secondLastName?: string;
  datetime?: string;
}

export default function RegisterEntranceExit() {
  const [formData, setFormData] = useState<EntranceExitForm>(defaultEntranceExitForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessType = searchParams.get('type') as AccessType || 'entrance';

  const { status: cedulaStatus, helperText: cedulaHelper, showForeignDialog, confirmForeign, denyForeign } =
    useCedulaLookup(formData.identification, (fullName) => {
      const parts = fullName.trim().split(/\s+/);
      setFormData(prev => ({
        ...prev,
        name: parts[0] ?? '',
        firstLastName: parts[1] ?? '',
        secondLastName: parts.slice(2).join(' ') ?? '',
      }));
    });

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      accessType: accessType,
      datetime: now
    }));
  }, [accessType]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const now = new Date();
    const selectedDate = new Date(formData.datetime);

    if (!formData.type) {
      newErrors.type = 'Debe seleccionar un tipo de persona/vehículo';
    }

    if (!formData.identification?.trim()) {
      newErrors.identification = 'La identificación es obligatoria';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.firstLastName?.trim()) {
      newErrors.firstLastName = 'El primer apellido es obligatorio';
    }

    if (!formData.secondLastName?.trim()) {
      newErrors.secondLastName = 'El segundo apellido es obligatorio';
    }

    if (!formData.datetime) {
      newErrors.datetime = 'La fecha y hora son obligatorias';
    } else {
      if (selectedDate > now) {
        newErrors.datetime = 'No se puede registrar una fecha futura';
      }

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (selectedDate < oneYearAgo) {
        newErrors.datetime = 'La fecha no puede ser anterior a un año';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EntranceExitForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (field: keyof EntranceExitForm, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const transformToApiPayload = (form: EntranceExitForm): EntranceExitApiPayload => {
    return {
      eeType: form.type,
      eeAccessType: form.accessType,
      eeIdentification: form.identification?.trim() || undefined,
      eeName: form.name?.trim() || undefined,
      eeFLastName: form.firstLastName?.trim() || undefined,
      eeSLastName: form.secondLastName?.trim() || undefined,
      eeDatetimeEntrance: form.accessType === 'entrance' ? form.datetime : undefined,
      eeDatetimeExit: form.accessType === 'exit' ? form.datetime : undefined,
      eeClose: form.close,
      eeObservations: form.observations?.trim() || undefined
    };
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

  const showConfirmationDialog = () => {
    const actionText = accessType === 'entrance' ? 'entrada' : 'salida';
    const person = formData.name?.trim() || formData.identification?.trim() || 'la persona';
    
    return Swal.fire({
      title: '¿Confirmar registro?',
      html: `
        <div class="text-start">
          <p><strong>Tipo:</strong> ${getTypeLabel(formData.type)}</p>
          <p><strong>Persona:</strong> ${person}</p>
          <p><strong>Fecha/Hora:</strong> ${new Date(formData.datetime).toLocaleString('es-ES')}</p>
          <p><strong>Acción:</strong> ${actionText}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      await Swal.fire({
        title: 'Errores en el formulario',
        text: 'Por favor corrige los errores antes de continuar',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await showConfirmationDialog();
    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const apiPayload = transformToApiPayload(formData);
      console.log('Payload a enviar:', JSON.stringify(apiPayload, null, 2));
      
      const response = await entranceExitService.createEntranceExit(apiPayload);
      console.log('Respuesta del servidor:', response);
      
      await Swal.fire({
        title: '¡Registro exitoso!',
        text: `El registro de ${accessType === 'entrance' ? 'entrada' : 'salida'} se ha guardado correctamente`,
        icon: 'success',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false
      });

      navigate('/entrance-exit');
    } catch (error) {
      console.error('Error creando registro:', error);
      console.error('Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        payload: transformToApiPayload(formData)
      });
      
      await Swal.fire({
        title: 'Error al guardar',
        text: 'Ocurrió un error al guardar el registro. Por favor intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Aceptar'
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
    return accessType === 'entrance' ? 'Registrar Entrada' : 'Registrar Salida';
  };

  const getDateTimeLabel = () => {
    return accessType === 'entrance' ? 'Fecha y Hora de Entrada' : 'Fecha y Hora de Salida';
  };

  return (
    <div className="container py-4">
      <EntranceExitNav />
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
              className={`form-select ${errors.type ? 'is-invalid' : ''}`}
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              required
            >
              <option value="">Seleccione un tipo</option>
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="identification" className="form-label">Identificación *</label>
            <div className="input-group">
              <input
                id="identification"
                type="text"
                className={`form-control ${errors.identification ? 'is-invalid' : cedulaStatus === 'found' ? 'is-valid' : cedulaStatus === 'not-found' || cedulaStatus === 'error' ? 'is-invalid' : ''}`}
                value={formData.identification}
                onChange={(e) => handleInputChange('identification', e.target.value)}
                placeholder="Número de identificación"
                required
              />
              {cedulaStatus === 'loading' && (
                <span className="input-group-text">
                  <span className="spinner-border spinner-border-sm text-secondary" />
                </span>
              )}
              {cedulaStatus === 'found' && (
                <span className="input-group-text text-success"><i className="bi bi-check-circle-fill" /></span>
              )}
              {(cedulaStatus === 'not-found' || cedulaStatus === 'error') && (
                <span className="input-group-text text-danger"><i className="bi bi-x-circle-fill" /></span>
              )}
              {errors.identification && <div className="invalid-feedback">{errors.identification}</div>}
            </div>
            {cedulaHelper && !errors.identification && (
              <div className={`form-text ${cedulaStatus === 'found' ? 'text-success' : cedulaStatus === 'not-found' || cedulaStatus === 'error' ? 'text-danger' : 'text-muted'}`}>
                {cedulaHelper}
              </div>
            )}
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <label htmlFor="name" className="form-label">Nombre *</label>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre"
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="firstLastName" className="form-label">Primer Apellido *</label>
            <input
              id="firstLastName"
              type="text"
              className={`form-control ${errors.firstLastName ? 'is-invalid' : ''}`}
              value={formData.firstLastName}
              onChange={(e) => handleInputChange('firstLastName', e.target.value)}
              placeholder="Primer apellido"
              required
            />
            {errors.firstLastName && <div className="invalid-feedback">{errors.firstLastName}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="secondLastName" className="form-label">Segundo Apellido *</label>
            <input
              id="secondLastName"
              type="text"
              className={`form-control ${errors.secondLastName ? 'is-invalid' : ''}`}
              value={formData.secondLastName}
              onChange={(e) => handleInputChange('secondLastName', e.target.value)}
              placeholder="Segundo apellido"
              required
            />
            {errors.secondLastName && <div className="invalid-feedback">{errors.secondLastName}</div>}
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <label htmlFor="datetime" className="form-label">{getDateTimeLabel()} *</label>
            <input
              id="datetime"
              type="datetime-local"
              className={`form-control ${errors.datetime ? 'is-invalid' : ''}`}
              value={formData.datetime}
              onChange={(e) => handleInputChange('datetime', e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
              required
            />
            {errors.datetime && <div className="invalid-feedback">{errors.datetime}</div>}
            <div className="form-text">
              No se pueden registrar fechas futuras
            </div>
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

      {showForeignDialog && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¿Identificación extranjera?</h5>
              </div>
              <div className="modal-body">
                <p>
                  El número <strong>{formData.identification}</strong> parece ser una cédula DIMEX u otro
                  tipo de identificación extranjera. ¿Desea buscar el nombre en el Registro de Extranjeros?
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={denyForeign}>No, ingresar manualmente</button>
                <button className="btn btn-primary" onClick={confirmForeign}>Sí, buscar nombre</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
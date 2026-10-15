'use client';

import { useEffect, useId, useState } from 'react';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';

interface ResidentSearchPickerProps {
  value: PatientBasicInfo | null;
  onChange: (resident: PatientBasicInfo | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function ResidentSearchPicker({
  value,
  onChange,
  label = 'Residente',
  required = false,
  disabled = false,
}: ResidentSearchPickerProps) {
  const inputId = useId();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<PatientBasicInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const displayValue = value ? value.fullName || value.name : term;

  useEffect(() => {
    const query = term.trim();
    if (value || query.length < 2) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError('');
      void virtualFileService.searchPatientsBasic(query)
        .then((patients) => {
          if (!cancelled) setResults(Array.isArray(patients) ? patients : []);
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
            setError('No se pudo buscar residentes. Inténtelo de nuevo.');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [term, value]);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold" htmlFor={inputId}>
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      <div className="input-group">
        <input
          id={inputId}
          className="form-control"
          value={displayValue}
          onChange={(event) => {
            setTerm(event.target.value);
            setLoading(false);
            if (event.target.value.trim().length < 2) {
              setResults([]);
              setError('');
            }
            if (value) onChange(null);
          }}
          placeholder="Buscar por nombre o identificación"
          disabled={disabled}
          required={required && !value}
          autoComplete="off"
        />
        {value && (
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onChange(null); setTerm(''); setResults([]); setError(''); setLoading(false); }} disabled={disabled}>
            Quitar
          </button>
        )}
      </div>
      {loading && <small className="text-muted d-block mt-1">Buscando residentes…</small>}
      {error && <small className="text-danger d-block mt-1" role="alert">{error}</small>}
      {!value && results.length > 0 && (
        <div className="list-group mt-1" role="listbox" aria-label="Resultados de residentes">
          {results.map((resident) => (
            <button
              key={resident.id}
              type="button"
              className="list-group-item list-group-item-action text-start"
              onClick={() => { onChange(resident); setTerm(''); setResults([]); setError(''); setLoading(false); }}
            >
              <span className="d-block fw-semibold">{resident.fullName || [resident.name, resident.firstLastName, resident.secondLastName].filter(Boolean).join(' ')}</span>
              <small className="text-muted">Identificación: {resident.identification}</small>
            </button>
          ))}
        </div>
      )}
      {!value && term.trim().length >= 2 && !loading && !error && results.length === 0 && (
        <small className="text-muted d-block mt-1">No se encontraron residentes.</small>
      )}
    </div>
  );
}

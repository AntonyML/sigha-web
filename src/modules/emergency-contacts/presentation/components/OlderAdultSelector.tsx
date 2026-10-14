/**
 * OlderAdultSelector
 *
 * Selector de adulto mayor sin exponer identificadores internos.
 * - Campo de búsqueda por cédula o por nombre (nunca por ID).
 * - Resultados en un <select> con "Nombre — Cédula: xxx".
 * - El ID interno viaja solo como value del <option> y en el callback,
 *   jamás se renderiza como texto visible.
 */
import { useState } from 'react';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';

export interface OlderAdultSelectorProps {
  value: PatientBasicInfo | null;
  onSelect: (patient: PatientBasicInfo | null) => void;
  disabled?: boolean;
  required?: boolean;
  selectId?: string;
}

const MIN_CHARS = 2;

export default function OlderAdultSelector({
  value,
  onSelect,
  disabled = false,
  required = false,
  selectId = 'older-adult-select',
}: OlderAdultSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PatientBasicInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const term = searchTerm.trim();
    if (term.length < MIN_CHARS || disabled) return;
    setSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const data = await virtualFileService.searchPatientsBasic(term);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
      setSearchError('No se pudo buscar. Intente de nuevo.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    if (!raw) {
      onSelect(null);
      return;
    }
    const found = results.find((p) => String(p.id) === raw) ?? null;
    onSelect(found);
  };

  return (
    <div>
      <label className="form-label fw-semibold" htmlFor={`${selectId}-search`}>
        Adulto mayor {required && <span className="text-danger">*</span>}
      </label>

      <div className="input-group mb-2">
        <input
          id={`${selectId}-search`}
          type="text"
          className="form-control"
          placeholder="Buscar por cédula o por nombre…"
          autoComplete="off"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleSearch();
            }
          }}
          disabled={disabled || searching}
        />
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={() => void handleSearch()}
          disabled={disabled || searching || searchTerm.trim().length < MIN_CHARS}
        >
          {searching ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-label="Buscando" />
          ) : (
            <>
              <i className="bi bi-search me-1" aria-hidden="true" />
              Buscar
            </>
          )}
        </button>
      </div>
      <div className="form-text mb-2">Escriba al menos 2 caracteres de la cédula o del nombre.</div>

      {searchError && (
        <div className="alert alert-danger py-2" role="alert">
          {searchError}
        </div>
      )}

      <select
        id={selectId}
        className="form-select"
        value={value ? String(value.id) : ''}
        onChange={handleSelectChange}
        disabled={disabled || results.length === 0}
        required={required}
        aria-label="Seleccionar adulto mayor"
      >
        <option value="">
          {hasSearched
            ? results.length === 0
              ? 'Sin resultados — ajuste la búsqueda'
              : 'Seleccione un adulto mayor…'
            : 'Busque primero por cédula o nombre…'}
        </option>
        {results.map((p) => (
          <option key={p.id} value={String(p.id)}>
            {p.fullName} — Cédula: {p.identification}
          </option>
        ))}
      </select>

      {hasSearched && !searching && results.length === 0 && !searchError && (
        <div className="form-text text-muted mt-1">Sin resultados para esa búsqueda.</div>
      )}

      {value && (
        <div className="alert alert-success py-2 mt-2 mb-0" role="status">
          <i className="bi bi-check-circle me-2" aria-hidden="true" />
          <strong>Seleccionado:</strong> {value.fullName} (Cédula: {value.identification})
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={() => onSelect(null)}
            disabled={disabled}
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}

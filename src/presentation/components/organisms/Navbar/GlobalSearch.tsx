/**
 * GlobalSearch
 *
 * Buscador rápido de adultos mayores (pacientes) en el top bar.
 * Usa virtualFileService.searchPatientsBasic() — endpoint ya existente:
 *   GET /virtual-records/search?search=<term>
 *
 * - Debounce 350ms para no saturar el backend
 * - Mínimo 2 caracteres para lanzar búsqueda
 * - Navega a /virtualFiles/view/:id al seleccionar un resultado
 * - Cierra con Escape o click fuera
 * - Accesible: roles ARIA, navegación por teclado
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Loader2 } from 'lucide-react';
import { virtualFileService } from '../../../../services/virtualFileService';
import type { PatientBasicInfo } from '../../../../types/virtualFile';
import './GlobalSearch.css';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 350;
const MAX_RESULTS = 6;

/* ────────────────────────────────────────────────────── */

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<PatientBasicInfo[]>([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Search logic with debounce ────────────────────── */
  const doSearch = useCallback(async (term: string) => {
    if (term.length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await virtualFileService.searchPatientsBasic(term);
      setResults(data.slice(0, MAX_RESULTS));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  /* ── Close on outside click ────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Keyboard navigation ───────────────────────────── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectResult(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  /* ── Navigate to patient detail ────────────────────── */
  const selectResult = (patient: PatientBasicInfo) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate(`/virtualFiles/view/${patient.id}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="gsearch-wrapper" ref={containerRef}>
      {/* Input */}
      <div className={`gsearch-input-wrap${open ? ' gsearch-input-wrap--open' : ''}`}>
        <span className="gsearch-icon-left" aria-hidden="true">
          {loading
            ? <Loader2 className="gsearch-spinner" />
            : <Search className="w-4 h-4" />
          }
        </span>

        <input
          ref={inputRef}
          className="gsearch-input"
          type="search"
          autoComplete="off"
          placeholder="Buscar residente…"
          aria-label="Buscar residente"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="gsearch-listbox"
          aria-activedescendant={activeIdx >= 0 ? `gsearch-opt-${activeIdx}` : undefined}
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveIdx(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />

        {query.length > 0 && (
          <button className="gsearch-clear" onClick={clearSearch} aria-label="Limpiar búsqueda" tabIndex={-1}>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          id="gsearch-listbox"
          className="gsearch-dropdown"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {results.length === 0 && !loading && (
            <li className="gsearch-empty">
              Sin resultados para "{query}"
            </li>
          )}

          {results.map((patient, idx) => (
            <li
              key={patient.id}
              id={`gsearch-opt-${idx}`}
              role="option"
              aria-selected={idx === activeIdx}
              className={`gsearch-item${idx === activeIdx ? ' gsearch-item--active' : ''}`}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseDown={(e) => { e.preventDefault(); selectResult(patient); }}
            >
              <span className="gsearch-item-avatar" aria-hidden="true">
                <User className="w-4 h-4" />
              </span>
              <span className="gsearch-item-body">
                <span className="gsearch-item-name">{patient.fullName}</span>
                <span className="gsearch-item-meta">
                  Cédula: {patient.identification}
                  {patient.status && (
                    <span className={`gsearch-item-status gsearch-item-status--${patient.status.toLowerCase()}`}>
                      {patient.status}
                    </span>
                  )}
                </span>
              </span>
            </li>
          ))}

          {results.length > 0 && (
            <li className="gsearch-footer">
              <button
                className="gsearch-view-all"
                onMouseDown={(e) => { e.preventDefault(); navigate('/virtualFiles'); setOpen(false); setQuery(''); }}
              >
                Ver todos los residentes →
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

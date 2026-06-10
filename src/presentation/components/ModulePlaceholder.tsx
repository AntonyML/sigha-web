// src/presentation/components/ModulePlaceholder.tsx
// Lightweight placeholder page used by the EPICA 3 modules whose
// flows are not yet wired to their services. The page renders
// a generic "coming soon" view + a list fetched through the flow.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export interface ModulePlaceholderProps {
  title: string;
  description: string;
  flowInstance: { [key: string]: (...args: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> };
  listMethod: string;
  listParams?: unknown[];
  newPath: string;
}

export default function ModulePlaceholder({
  title,
  description,
  flowInstance,
  listMethod,
  listParams = [],
  newPath,
}: ModulePlaceholderProps) {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const fn = flowInstance[listMethod];
        if (typeof fn !== 'function') {
          setError(`Método "${listMethod}" no existe en el flow.`);
          return;
        }
        const result = await fn.apply(flowInstance, listParams);
        if (cancelled) return;
        if (result.success && Array.isArray(result.data)) {
          setItems(result.data);
        } else {
          setError(result.error ?? 'Sin datos por ahora.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flowInstance, listMethod, listParams]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">{title}</h1>
          <p className="text-muted mb-0">{description}</p>
        </div>
        <Link to={newPath} className="btn btn-primary">
          + Crear
        </Link>
      </div>

      {loading && <p>Cargando…</p>}
      {error && (
        <div className="alert alert-warning" role="alert">
          <strong>Aviso:</strong> {error}
          <div className="small mt-2">
            Este módulo está parcialmente integrado. La página, la ruta y el
            flow están conectados; el flow todavía devuelve error hasta que el
            servicio subyacente termine de cablearse en su método
            correspondiente.
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-muted">No hay registros todavía.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <pre className="bg-light p-3 rounded" style={{ maxHeight: 400, overflow: 'auto' }}>
          {JSON.stringify(items, null, 2)}
        </pre>
      )}
    </div>
  );
}

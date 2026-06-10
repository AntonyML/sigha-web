// src/presentation/pages/clinical-history/ClinicalHistoryListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { clinicalHistoryFlow } from '../../../infrastructure/flows';

export default function ClinicalHistoryListPage() {
  return (
    <ModulePlaceholder
      title="Historial clínico"
      description="Historial clínico por adulto mayor (condiciones, vacunas, observaciones)."
      flowInstance={clinicalHistoryFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/clinical-history/create"
    />
  );
}

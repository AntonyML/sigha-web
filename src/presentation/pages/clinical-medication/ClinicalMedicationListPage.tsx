// src/presentation/pages/clinical-medication/ClinicalMedicationListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { clinicalMedicationFlow } from '../../../infrastructure/flows';

export default function ClinicalMedicationListPage() {
  return (
    <ModulePlaceholder
      title="Medicamentos clínicos"
      description="Medicamentos asociados a historiales clínicos."
      flowInstance={clinicalMedicationFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/clinical-medication/create"
    />
  );
}

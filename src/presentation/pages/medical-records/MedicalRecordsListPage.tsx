// src/presentation/pages/medical-records/MedicalRecordsListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { medicalRecordFlow } from '../../../infrastructure/flows';

export default function MedicalRecordsListPage() {
  return (
    <ModulePlaceholder
      title="Historial médico"
      description="Registro cronológico por adulto mayor (motivo, diagnóstico, tratamiento)."
      flowInstance={medicalRecordFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/medical-records/create"
    />
  );
}

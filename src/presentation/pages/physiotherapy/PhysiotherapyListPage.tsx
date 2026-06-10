// src/presentation/pages/physiotherapy/PhysiotherapyListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { physiotherapyFlow } from '../../../infrastructure/flows';

export default function PhysiotherapyListPage() {
  return (
    <ModulePlaceholder
      title="Fisioterapia"
      description="Sesiones de fisioterapia (evaluación, terapia, seguimiento)."
      flowInstance={physiotherapyFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAllSessions"
      newPath="/physiotherapy/create"
    />
  );
}

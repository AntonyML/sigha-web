// src/presentation/pages/psychology/PsychologyListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { psychologyFlow } from '../../../infrastructure/flows';

export default function PsychologyListPage() {
  return (
    <ModulePlaceholder
      title="Psicología"
      description="Sesiones de psicología (evaluación, terapia, seguimiento, terapia grupal)."
      flowInstance={psychologyFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAllSessions"
      newPath="/psychology/create"
    />
  );
}

// src/presentation/pages/specialized-areas/SpecializedAreasListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { specializedAreaFlow } from '../../../infrastructure/flows';

export default function SpecializedAreasListPage() {
  return (
    <ModulePlaceholder
      title="Áreas especializadas"
      description="Áreas operativas (enfermería, fisioterapia, psicología, trabajo social)."
      flowInstance={specializedAreaFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/specialized-areas/create"
    />
  );
}

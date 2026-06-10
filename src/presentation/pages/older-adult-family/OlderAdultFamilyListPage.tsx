// src/presentation/pages/older-adult-family/OlderAdultFamilyListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { olderAdultFamilyFlow } from '../../../infrastructure/flows';

export default function OlderAdultFamilyListPage() {
  return (
    <ModulePlaceholder
      title="Familiares"
      description="Familiares asociados a cada adulto mayor."
      flowInstance={olderAdultFamilyFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/older-adult-family/create"
    />
  );
}

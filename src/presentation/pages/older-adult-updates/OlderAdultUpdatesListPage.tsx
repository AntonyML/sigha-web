// src/presentation/pages/older-adult-updates/OlderAdultUpdatesListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { olderAdultUpdateFlow } from '../../../infrastructure/flows';

export default function OlderAdultUpdatesListPage() {
  return (
    <ModulePlaceholder
      title="Actualizaciones de adultos mayores"
      description="Bitácora de cambios en los registros de adultos mayores."
      flowInstance={olderAdultUpdateFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/older-adult-updates/create"
    />
  );
}

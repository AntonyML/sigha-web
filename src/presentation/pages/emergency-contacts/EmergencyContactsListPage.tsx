// src/presentation/pages/emergency-contacts/EmergencyContactsListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { emergencyContactFlow } from '../../../infrastructure/flows';

export default function EmergencyContactsListPage() {
  return (
    <ModulePlaceholder
      title="Contactos de emergencia"
      description="Teléfonos de emergencia asociados a cada adulto mayor."
      flowInstance={emergencyContactFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/emergency-contacts/create"
    />
  );
}

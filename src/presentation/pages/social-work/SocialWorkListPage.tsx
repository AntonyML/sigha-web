// src/presentation/pages/social-work/SocialWorkListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { socialWorkFlow } from '../../../infrastructure/flows';

export default function SocialWorkListPage() {
  return (
    <ModulePlaceholder
      title="Trabajo social"
      description="Informes de trabajo social (visitas domiciliarias, entrevistas, seguimiento)."
      flowInstance={socialWorkFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAllReports"
      newPath="/social-work/create"
    />
  );
}

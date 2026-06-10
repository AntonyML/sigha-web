// src/presentation/pages/specialized-appointments/SpecializedAppointmentsListPage.tsx
import ModulePlaceholder from '../../components/ModulePlaceholder';
import { specializedAppointmentFlow } from '../../../infrastructure/flows';

export default function SpecializedAppointmentsListPage() {
  return (
    <ModulePlaceholder
      title="Citas especializadas"
      description="Citas por área (fisioterapia, psicología, trabajo social, enfermería)."
      flowInstance={specializedAppointmentFlow as unknown as { [k: string]: (...a: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }> }}
      listMethod="getAll"
      newPath="/specialized-appointments/create"
    />
  );
}

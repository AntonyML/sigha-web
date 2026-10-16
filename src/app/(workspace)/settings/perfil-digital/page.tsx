'use client';

import { Suspense } from 'react';
import ConfiguradorPerfilDigitalPage from '@/modules/administration/presentation/pages/perfil-digital/ConfiguradorPerfilDigitalPage';
import { LoadingSpinner } from '@/shared/ui';

export default function PerfilDigitalSettingsRoute() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando configurador de perfil digital..." />}>
      <ConfiguradorPerfilDigitalPage />
    </Suspense>
  );
}

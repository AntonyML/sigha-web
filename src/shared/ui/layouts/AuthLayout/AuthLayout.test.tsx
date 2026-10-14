import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const { getCurrentMock } = vi.hoisted(() => ({
  getCurrentMock: vi.fn(),
}));

vi.mock('@/shared/assets/images/asopogua.png', () => ({
  default: { src: '/asopogua.png' },
}));

vi.mock('@/infrastructure/api/services/organizationsService', () => ({
  organizationsService: { getCurrent: getCurrentMock },
}));

vi.mock('@/app/providers/SettingsContext', () => ({
  useAppSettings: () => ({ appName: 'SIGHA', logoUrl: '', timezone: 'America/Costa_Rica' }),
}));

import { AuthLayout, resolveAuthBrand } from '@/shared/ui/layouts/AuthLayout/AuthLayout';

describe('resolveAuthBrand — cadena de fallback sin PNG genérico', () => {
  it('usa el logo de la org activa cuando existe', () => {
    expect(
      resolveAuthBrand({ slug: 'otra-org', logoUrl: 'https://cdn/logo.png' }),
    ).toBe('org-logo');
  });

  it('usa asopogua.png SOLO con slug asopogua sin logo propio', () => {
    expect(resolveAuthBrand({ slug: 'asopogua', logoUrl: null })).toBe('asopogua');
  });

  it('marca neutra para otra org sin logo', () => {
    expect(resolveAuthBrand({ slug: 'otra-org', logoUrl: null })).toBe('neutral');
  });

  it('marca neutra sin sesión', () => {
    expect(resolveAuthBrand(null)).toBe('neutral');
  });
});

describe('AuthLayout — render del fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  function withSession() {
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
  }

  it('muestra el logo de la org activa', async () => {
    withSession();
    getCurrentMock.mockResolvedValue({
      id: 2,
      name: 'Otra org',
      slug: 'otra-org',
      logoUrl: 'https://cdn/org.png',
    });
    render(<AuthLayout title="Acceso">hijos</AuthLayout>);
    const img = (await screen.findByAltText('Logo SIGHA')) as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toContain('https://cdn/org.png');
  });

  it('muestra asopogua.png para ASOPOGUA sin logo y ninguna otra org lo ve', async () => {
    withSession();
    getCurrentMock.mockResolvedValue({
      id: 1,
      name: 'ASOPOGUA',
      slug: 'asopogua',
      logoUrl: null,
    });
    render(<AuthLayout title="Acceso">hijos</AuthLayout>);
    const img = (await screen.findByAltText('Logo SIGHA')) as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toContain('asopogua.png');
  });

  it('marca neutra con la S para org sin logo', async () => {
    withSession();
    getCurrentMock.mockResolvedValue({
      id: 2,
      name: 'Otra org',
      slug: 'otra-org',
      logoUrl: null,
    });
    render(<AuthLayout title="Acceso">hijos</AuthLayout>);
    await waitFor(() => expect(getCurrentMock).toHaveBeenCalled());
    expect(screen.getByRole('img', { name: 'Logo SIGHA' })).toBeInTheDocument();
    expect(screen.queryByAltText('Logo SIGHA')?.tagName).not.toBe('IMG');
    expect(screen.getByText('S', { selector: 'span' })).toBeInTheDocument();
  });

  it('marca neutra sin sesión y sin llamar al backend', async () => {
    render(<AuthLayout title="Acceso">hijos</AuthLayout>);
    expect(screen.getByRole('img', { name: 'Logo SIGHA' })).toBeInTheDocument();
    expect(getCurrentMock).not.toHaveBeenCalled();
  });
});

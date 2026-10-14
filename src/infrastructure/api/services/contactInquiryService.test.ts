import { describe, it, expect, vi, beforeEach } from 'vitest';

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: {
    post: postMock,
  },
}));

import { contactInquiryService } from './contactInquiryService';

describe('contactInquiryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitInquiry envía POST /contact-inquiries con el payload correspondiente', async () => {
    postMock.mockResolvedValue({
      data: {
        success: true,
        message: 'Tu consulta fue enviada exitosamente.',
      },
    });

    const payload = {
      name: 'Mario Méndez',
      organization: 'Fundación Huellas',
      email: 'mario@huellas.cr',
      message: 'Consulta sobre voluntariado en SIGHA',
    };

    const result = await contactInquiryService.submitInquiry(payload);

    expect(postMock).toHaveBeenCalledWith('/contact-inquiries', payload);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Tu consulta fue enviada exitosamente.');
  });
});

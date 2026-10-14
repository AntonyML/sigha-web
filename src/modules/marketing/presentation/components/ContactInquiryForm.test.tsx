import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ContactInquiryForm from './ContactInquiryForm';
import { contactInquiryService } from '@/infrastructure/api/services/contactInquiryService';

vi.mock('@/infrastructure/api/services/contactInquiryService', () => ({
  contactInquiryService: {
    submitInquiry: vi.fn(),
  },
}));

describe('ContactInquiryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza los campos requeridos', () => {
    render(<ContactInquiryForm />);
    expect(screen.getByLabelText(/Nombre/i)).toBeDefined();
    expect(screen.getByLabelText(/Organización/i)).toBeDefined();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeDefined();
    expect(screen.getByLabelText(/¿Qué te gustaría conocer\?/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Enviar consulta/i })).toBeDefined();
  });

  it('envía la consulta mediante contactInquiryService y muestra mensaje de éxito', async () => {
    vi.mocked(contactInquiryService.submitInquiry).mockResolvedValueOnce({
      success: true,
      message: 'Tu consulta fue enviada con éxito.',
    });

    render(<ContactInquiryForm />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Andrea Mora' } });
    fireEvent.change(screen.getByLabelText(/Organización/i), { target: { value: 'Cruz Roja' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'andrea@cruzroja.cr' } });
    fireEvent.change(screen.getByLabelText(/¿Qué te gustaría conocer\?/i), {
      target: { value: 'Deseamos información sobre convenios institucionales.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Enviar consulta/i }));

    await waitFor(() => {
      expect(contactInquiryService.submitInquiry).toHaveBeenCalledWith({
        name: 'Andrea Mora',
        organization: 'Cruz Roja',
        email: 'andrea@cruzroja.cr',
        message: 'Deseamos información sobre convenios institucionales.',
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeDefined();
      expect(screen.getByText(/Tu consulta fue enviada con éxito/i)).toBeDefined();
    });
  });

  it('muestra mensaje de error si el servicio falla', async () => {
    vi.mocked(contactInquiryService.submitInquiry).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Error en el servidor al enviar correo.',
        },
      },
    });

    render(<ContactInquiryForm />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Carlos Ruiz' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'carlos@ruiz.cr' } });
    fireEvent.change(screen.getByLabelText(/¿Qué te gustaría conocer\?/i), {
      target: { value: 'Consulta sobre atención clínica.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Enviar consulta/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/Error en el servidor al enviar correo/i)).toBeDefined();
    });
  });
});

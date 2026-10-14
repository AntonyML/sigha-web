import { httpClient } from '@/infrastructure/api/httpClient';

export interface CreateContactInquiryPayload {
  name: string;
  organization?: string;
  email: string;
  message: string;
}

export interface ContactInquiryResponse {
  success: boolean;
  message: string;
}

export const contactInquiryService = {
  async submitInquiry(payload: CreateContactInquiryPayload): Promise<ContactInquiryResponse> {
    const response = await httpClient.post<ContactInquiryResponse>('/contact-inquiries', payload);
    return response.data;
  },
};

// Tipos sincronizados con backend: controller/notifications/notification.controller.ts
// Endpoint base: /notifications

export interface NotificationAttachment {
  id?: number;
  naFileName: string;
  naFilePath: string;
  naFileMimeType: string;
  naFileSizeKb: number;
}

export interface Notification {
  id: number;
  nTitle: string;
  nMessage: string;
  nSendDate?: string;
  nSent: boolean;
  nStatus?: string;
  created_at: string;
  updated_at?: string;
  sender?: {
    id: number;
    name: string;
    firstLastName: string;
    email: string;
  };
  attachments?: NotificationAttachment[];
}

export interface CreateNotificationDto {
  nTitle: string;
  nMessage: string;
  nSendDate?: string;
  nSent?: boolean;
  attachments?: Omit<NotificationAttachment, 'id'>[];
}

export interface UpdateNotificationDto {
  nTitle?: string;
  nMessage?: string;
  nSendDate?: string;
  nSent?: boolean;
  attachments?: Omit<NotificationAttachment, 'id'>[];
}

export interface SearchNotificationDto {
  search?: string;
  sendDateFrom?: string;
  sendDateTo?: string;
  nSent?: boolean;
  idSender?: number;
  page?: number;
  limit?: number;
}

export interface NotificationApiResponse {
  message: string;
  data: Notification[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface SingleNotificationApiResponse {
  message: string;
  data: Notification;
}

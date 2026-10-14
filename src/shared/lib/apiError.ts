import axios, { type AxiosError } from 'axios';

export type ApiErrorBody = { message?: string | string[] };

export function getApiAxiosError(error: unknown): AxiosError<ApiErrorBody> | undefined {
  return axios.isAxiosError<ApiErrorBody>(error) ? error : undefined;
}

export function isNetworkError(error: unknown): boolean {
  const axiosError = getApiAxiosError(error);
  if (axiosError) {
    return axiosError.code === 'ERR_NETWORK' || !axiosError.response;
  }

  return error instanceof Error && error.message === 'Network Error';
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const message = getApiAxiosError(error)?.response?.data?.message;
  if (typeof message === 'string' && message.length > 0) return message;
  if (Array.isArray(message) && message.length > 0) return message.join(', ');
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

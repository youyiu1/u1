export type ToastType = 'success' | 'info' | 'error';

export interface ToastState {
  message: string;
  type: ToastType;
}
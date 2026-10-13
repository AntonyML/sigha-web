import Swal from 'sweetalert2';

export const showError = async (title: string, text: string) => {
  await Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Aceptar',
  });
};

export const showSuccess = async (title: string, text: string) => {
  await Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Aceptar',
  });
};

export const showWarning = async (title: string, text: string) => {
  await Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Aceptar',
  });
};

export const showInfo = async (title: string, text: string) => {
  await Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Aceptar',
  });
};

export const showConfirm = async (title: string, text: string, confirmText = 'Sí', cancelText = 'Cancelar') => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
};

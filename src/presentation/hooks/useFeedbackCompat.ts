import { useFeedback } from '../context/FeedbackContext';

export const useFeedbackCompat = () => {
  const feedback = useFeedback();

  return {
    showError: (title: string, text: string) => {
      feedback.error(text, title);
    },
    showSuccess: (title: string, text: string) => {
      feedback.success(text, title);
    },
    showWarning: (title: string, text: string) => {
      feedback.warning(text, title);
    },
    showInfo: (title: string, text: string) => {
      feedback.info(text, title);
    },
    showConfirm: async (
      title: string,
      text: string
    ): Promise<boolean> => {
      return await feedback.confirm(title, text);
    },
  };
};

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import YesavagePfeifferModal from './YesavagePfeifferModal';
import { pfeifferQuestions, yesavageQuestions } from '../../domain/yesavagePfeifferScoring';

const mocks = vi.hoisted(() => ({
  createPsychology: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/infrastructure/api/services/specialtiesEvaluationsService', () => ({
  specialtiesEvaluationsService: {
    createPsychology: mocks.createPsychology,
  },
}));

vi.mock('@/shared/hooks/useFeedbackWithNotifications', () => ({
  useFeedbackWithNotifications: () => ({
    success: mocks.success,
    error: mocks.error,
  }),
}));

describe('YesavagePfeifferModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPsychology.mockResolvedValue({ id: 42 });
  });

  it('requires all items and sends scored responses without a client supplied evaluator', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const { container } = render(
      <YesavagePfeifferModal idOlderAdult={17} onClose={onClose} onSuccess={onSuccess} />,
    );

    const submit = screen.getByRole('button', { name: 'Guardar evaluación' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    yesavageQuestions.forEach((question, index) => {
      const answer = container.querySelector<HTMLInputElement>(
        `input[name="yesavage-${index}"][value="${question.scoreOn}"]`,
      );
      expect(answer).not.toBeNull();
      fireEvent.click(answer as HTMLInputElement);
    });
    pfeifferQuestions.forEach((_, index) => {
      const answer = container.querySelector<HTMLInputElement>(
        `input[name="pfeiffer-${index}"][value="${index === 3 ? 'incorrect' : 'correct'}"]`,
      );
      expect(answer).not.toBeNull();
      fireEvent.click(answer as HTMLInputElement);
    });

    expect(submit.disabled).toBe(false);
    fireEvent.click(submit);

    await waitFor(() => expect(mocks.createPsychology).toHaveBeenCalledTimes(1));
    expect(mocks.createPsychology).toHaveBeenCalledWith({
      idOlderAdult: 17,
      yesavageResponses: Array(15).fill(true),
      pfeifferResponses: [false, false, false, true, false, false, false, false, false, false],
      emotionalState: undefined,
      behavioralObservations: undefined,
      interventionPlan: undefined,
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.error).not.toHaveBeenCalled();
  });
});

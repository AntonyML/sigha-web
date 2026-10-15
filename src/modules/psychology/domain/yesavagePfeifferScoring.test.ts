import { describe, expect, it } from 'vitest';
import {
  pfeifferQuestions,
  scorePfeifferAnswers,
  scoreYesavageAnswers,
  toPfeifferScoredResponses,
  toYesavageScoredResponses,
  yesavageQuestions,
  type YesNoAnswer,
} from './yesavagePfeifferScoring';

describe('Yesavage and Pfeiffer response scoring', () => {
  it('scores Yesavage according to each question direction', () => {
    const answers = yesavageQuestions.map((question) => question.scoreOn);

    expect(scoreYesavageAnswers(answers)).toBe(15);
    expect(toYesavageScoredResponses(answers)).toEqual(Array(15).fill(true));
    expect(scoreYesavageAnswers(yesavageQuestions.map(() => 'yes'))).toBe(10);
  });

  it('requires every Yesavage response before calculating or submitting', () => {
    const answers: YesNoAnswer[] = yesavageQuestions.map(() => null);
    answers[0] = 'yes';

    expect(scoreYesavageAnswers(answers)).toBeNull();
    expect(toYesavageScoredResponses(answers)).toBeNull();
  });

  it('counts Pfeiffer errors and preserves the per-item scoring breakdown', () => {
    const answers = pfeifferQuestions.map((_, index) => (index === 2 || index === 9 ? 'incorrect' : 'correct'));

    expect(scorePfeifferAnswers(answers)).toBe(2);
    expect(toPfeifferScoredResponses(answers)).toEqual([false, false, true, false, false, false, false, false, false, true]);
  });

  it('requires all ten Pfeiffer outcomes before calculating or submitting', () => {
    expect(scorePfeifferAnswers(Array(9).fill('correct'))).toBeNull();
    expect(toPfeifferScoredResponses(Array(9).fill('correct'))).toBeNull();
  });
});

export type YesNoAnswer = 'yes' | 'no' | null;
export type PfeifferOutcome = 'correct' | 'incorrect' | null;

export const yesavageQuestions = [
  { prompt: '¿Se considera satisfecho(a) de su vida?', scoreOn: 'no' },
  { prompt: '¿Ha ido abandonando muchas de sus actividades e intereses?', scoreOn: 'yes' },
  { prompt: '¿Se aburre a menudo?', scoreOn: 'yes' },
  { prompt: '¿Siente que su vida está vacía?', scoreOn: 'yes' },
  { prompt: '¿Está de buen ánimo la mayor parte del tiempo?', scoreOn: 'no' },
  { prompt: '¿Tiene miedo de que le pueda ocurrir algo malo?', scoreOn: 'yes' },
  { prompt: '¿Está contento(a) la mayor parte del tiempo?', scoreOn: 'no' },
  { prompt: '¿Se siente a menudo desvalido(a)?', scoreOn: 'yes' },
  { prompt: '¿Prefiere quedarse en casa en vez de hacer otras cosas?', scoreOn: 'yes' },
  { prompt: '¿Siente que tiene más problemas con su memoria que la mayoría de las personas?', scoreOn: 'yes' },
  { prompt: '¿Piensa que es maravilloso estar vivo(a)?', scoreOn: 'no' },
  { prompt: '¿Se siente muy inútil como está en este momento?', scoreOn: 'yes' },
  { prompt: '¿Se siente lleno(a) de energía?', scoreOn: 'no' },
  { prompt: '¿Siente su situación como sin esperanzas?', scoreOn: 'yes' },
  { prompt: '¿Cree que la mayoría está mejor que usted?', scoreOn: 'yes' },
] as const;

export const pfeifferQuestions = [
  '¿Qué fecha es hoy? (día, mes y año)',
  '¿Qué día de la semana es hoy?',
  '¿Cuál es su número de teléfono? Si no tiene, ¿cuál es su dirección?',
  '¿Dónde estamos ahora? (lugar o edificio)',
  '¿Cuántos años tiene?',
  '¿En qué fecha nació? (día, mes y año)',
  '¿Quién ocupa actualmente la Presidencia de la República de Costa Rica?',
  '¿Quién ocupó ese cargo antes?',
  '¿Cuál es el primer apellido de su madre?',
  'Reste de 3 en 3 desde 20. Cualquier error cuenta como respuesta incorrecta.',
] as const;

export function scoreYesavageAnswers(answers: readonly YesNoAnswer[]): number | null {
  if (answers.length !== yesavageQuestions.length || answers.some((answer) => answer === null)) {
    return null;
  }

  return answers.reduce((score, answer, index) => {
    const expectedScoredAnswer = yesavageQuestions[index].scoreOn;
    return score + Number(answer === expectedScoredAnswer);
  }, 0);
}

export function toYesavageScoredResponses(answers: readonly YesNoAnswer[]): boolean[] | null {
  if (answers.length !== yesavageQuestions.length || answers.some((answer) => answer === null)) {
    return null;
  }

  return answers.map((answer, index) => answer === yesavageQuestions[index].scoreOn);
}

export function scorePfeifferAnswers(answers: readonly PfeifferOutcome[]): number | null {
  if (answers.length !== pfeifferQuestions.length || answers.some((answer) => answer === null)) {
    return null;
  }

  return answers.filter((answer) => answer === 'incorrect').length;
}

export function toPfeifferScoredResponses(answers: readonly PfeifferOutcome[]): boolean[] | null {
  if (answers.length !== pfeifferQuestions.length || answers.some((answer) => answer === null)) {
    return null;
  }

  return answers.map((answer) => answer === 'incorrect');
}

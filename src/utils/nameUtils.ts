// src/utils/nameUtils.ts
//
// Lógica única y centralizada para separar un nombre completo en sus partes,
// siguiendo la convención de nombres de Costa Rica:
//
//   [Nombre(s)] [Primer apellido] [Segundo apellido]
//
// Las personas pueden tener uno, dos o incluso tres nombres de pila
// (ej: "Antony Jafeth Monge Lopez" → nombres: "Antony Jafeth"), por lo que
// NUNCA se debe asumir que la segunda palabra es el primer apellido.
//
// Regla correcta: las ÚLTIMAS DOS palabras son siempre los apellidos;
// todo lo que viene antes son los nombres de pila.
//
// Este archivo es el ÚNICO lugar donde debe vivir esta lógica. Cualquier
// componente, servicio o transformador que necesite separar un nombre
// completo debe importar `splitFullName` de aquí — nunca reimplementar
// un `.split(' ')` a mano.

export interface SplitFullNameResult {
  /** Uno o más nombres de pila, ej: "Antony Jafeth" */
  givenNames: string;
  /** Primer apellido */
  firstLastName: string;
  /** Segundo apellido */
  secondLastName: string;
}

/**
 * Separa un nombre completo en nombres y apellidos.
 *
 * Reglas:
 *  - 0 palabras  → todo vacío.
 *  - 1 palabra   → se asume que es un nombre de pila (sin apellidos aún).
 *  - 2 palabras  → nombre + primer apellido (sin segundo apellido).
 *  - 3+ palabras → las últimas 2 son los apellidos; el resto son los nombres.
 *
 * Ejemplos:
 *   "Antony Jafeth Monge Lopez" → { givenNames: "Antony Jafeth", firstLastName: "Monge", secondLastName: "Lopez" }
 *   "Maria Rodriguez Leon"      → { givenNames: "Maria", firstLastName: "Rodriguez", secondLastName: "Leon" }
 *   "Juan Perez"                → { givenNames: "Juan", firstLastName: "Perez", secondLastName: "" }
 */
export function splitFullName(fullName: string | undefined | null): SplitFullNameResult {
  const words = (fullName ?? '').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return { givenNames: '', firstLastName: '', secondLastName: '' };
  }
  if (words.length === 1) {
    return { givenNames: words[0], firstLastName: '', secondLastName: '' };
  }
  if (words.length === 2) {
    return { givenNames: words[0], firstLastName: words[1], secondLastName: '' };
  }

  const secondLastName = words[words.length - 1];
  const firstLastName = words[words.length - 2];
  const givenNames = words.slice(0, words.length - 2).join(' ');

  return { givenNames, firstLastName, secondLastName };
}

/**
 * Operación inversa: arma un nombre completo a partir de sus partes,
 * omitiendo segmentos vacíos y normalizando espacios.
 */
export function joinFullName(givenNames: string, firstLastName: string, secondLastName?: string): string {
  return [givenNames, firstLastName, secondLastName]
    .map(s => (s ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

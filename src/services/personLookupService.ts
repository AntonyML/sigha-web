// src/services/personLookupService.ts
//
// Wrapper único para la consulta de identificación de personas.
//
// Objetivo: centralizar en un solo punto la llamada al proveedor externo
// de datos de identificación. Ningún otro archivo del front debe conocer
// la URL, el proveedor, ni el formato de respuesta crudo — todos consumen
// esta interfaz genérica.
//
// Ventajas de tenerlo centralizado acá:
//   - Si el proveedor cambia (por ejemplo, se mueve a un endpoint propio
//     del backend que actúe como proxy/cache), solo se edita este archivo.
//   - Ningún texto ni componente de la UI expone el nombre del proveedor.
//   - Permite agregar fácilmente timeout, caché, reintentos o rate-limiting
//     en un solo lugar.

import axios from 'axios';

export interface PersonLookupResult {
  found: boolean;
  fullName?: string;
}

const LOOKUP_TIMEOUT_MS = 8000;

// Endpoint del proveedor externo de identificación.
// No exponer ni loguear esta URL en mensajes visibles al usuario.
const IDENTIFICATION_LOOKUP_URL = 'https://api.hacienda.go.cr/fe/ae';

export const personLookupService = {
  /**
   * Busca el nombre asociado a un número de identificación.
   * Devuelve `{ found: false }` ante cualquier error o ausencia de datos,
   * nunca lanza excepciones hacia el llamador.
   */
  async lookupByIdentification(digits: string): Promise<PersonLookupResult> {
    try {
      const { data } = await axios.get(IDENTIFICATION_LOOKUP_URL, {
        params: { identificacion: digits },
        timeout: LOOKUP_TIMEOUT_MS,
      });

      if (data?.nombre) {
        return { found: true, fullName: data.nombre as string };
      }
      return { found: false };
    } catch {
      return { found: false };
    }
  },
};

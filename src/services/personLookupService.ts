// src/services/personLookupService.ts
//
// Wrapper único para la consulta de identificación de personas.
//
// Objetivo: centralizar en un solo punto la llamada a este servicio.
// Ningún otro archivo del front debe conocer el proveedor real ni el
// formato de respuesta crudo — todos consumen esta interfaz genérica.
//
// La consulta se resuelve contra nuestro propio backend (sigha-api), que
// actúa como proxy hacia el proveedor externo. Esto evita:
//   - Problemas de CORS (el navegador nunca llama directo al proveedor).
//   - Exponer la URL/proveedor real en el bundle o en la pestaña Network.
//   - Reenviar al usuario el texto o la estructura cruda del proveedor:
//     el backend siempre normaliza la respuesta a { found, fullName }.

import { httpClient } from './httpClient';

export interface PersonLookupResult {
  found: boolean;
  fullName?: string;
}

export const personLookupService = {
  /**
   * Busca el nombre asociado a un número de identificación.
   * Devuelve `{ found: false }` ante cualquier error, nunca lanza excepciones
   * hacia el llamador.
   */
  async lookupByIdentification(digits: string): Promise<PersonLookupResult> {
    try {
      const { data } = await httpClient.get<PersonLookupResult>('/identification-lookup', {
        params: { identification: digits },
      });
      return {
        found: !!data?.found,
        fullName: data?.fullName,
      };
    } catch {
      return { found: false };
    }
  },
};

/** Factories de datos de prueba (independientes de la red). */

let sequence = 0;

/** Genera una identificación de 9 dígitos única (requisito del backend: solo dígitos). */
export function uniqueIdentification(): string {
  sequence += 1;
  const now = String(Date.now());
  const tail = now.slice(now.length - 8);
  return `9${tail}${sequence}`.slice(0, 9);
}

/**
 * Payload válido para POST /virtual-records/create.
 * Cumple las validaciones del DTO (CreateVirtualRecordDirectDto) y de la
 * función SQL create_virtual_file (familia obligatoria).
 */
export function buildCreatePayload(identification: string): Record<string, unknown> {
  return {
    oa_identification: identification,
    oa_document_type: 'nacional',
    oa_name: 'Persona',
    oa_f_last_name: 'E2E',
    oa_s_last_name: 'Prueba',
    oa_birthdate: '1990-01-01',
    oa_marital_status: 'single',
    oa_dwelling: 'Propia',
    oa_years_schooling: 'complete primary',
    oa_previous_work: 'No especificado',
    oa_is_retired: false,
    oa_has_pension: false,
    oa_other: false,
    oa_other_description: null,
    oa_province: '',
    oa_canton: '',
    oa_district: '',
    oa_children_count: 0,
    oa_status: 'alive',
    oa_death_date: null,
    oa_economic_income: 0,
    oa_phone_numner: '',
    oa_email: '',
    oa_profile_photo_url: null,
    oa_gender: 'not specified',
    oa_blood_type: 'UNKNOWN',
    program: { id: 1, sub_programs: [] },
    family: {
      pf_identification: identification,
      pf_document_type: 'nacional',
      pf_name: 'Familiar',
      pf_f_last_name: 'Contacto',
      pf_s_last_name: 'Prueba',
      pf_phone_number: '',
      pf_email: 'familiar.e2e@example.com',
      pf_kinship: 'son',
    },
    clinical_history: {
      ch_frequent_falls: false,
      ch_neoplasms: false,
      ch_vision_problems: false,
      ch_vision_hearing: false,
    },
  };
}
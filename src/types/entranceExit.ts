export type EntranceExitType = 'employee' | 'older adult' | 'visitor' | 'volunteer' | 'vehicle' | 'other';
export type AccessType = 'entrance' | 'exit';

export interface EntranceExitApiPayload {
  eeType: EntranceExitType;
  eeAccessType: AccessType;
  eeIdentification?: string;
  eeName?: string;
  eeFLastName?: string;
  eeSLastName?: string;
  eeDatetimeEntrance?: string;
  eeDatetimeExit?: string;
  eeClose: boolean;
  eeObservations?: string;
}

export interface EntranceExitResponse extends EntranceExitApiPayload {
  id: number;
  createAt: string;
}

export interface EntranceExitForm {
  id?: number;
  type: EntranceExitType;
  accessType: AccessType;
  identification: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  datetime: string;
  observations: string;
  close: boolean;
}

export const defaultEntranceExitForm: EntranceExitForm = {
  type: 'other',
  accessType: 'entrance',
  identification: '',
  name: '',
  firstLastName: '',
  secondLastName: '',
  datetime: '',
  observations: '',
  close: false
};
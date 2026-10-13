export interface OlderAdultUpdate {
  id: number;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: number;
  idOlderAdult?: number;
  createdAt?: string;
}

export interface OlderAdultUpdatesFilterParams {
  olderAdultId?: number;
  fieldChanged?: string;
  changedBy?: number;
}

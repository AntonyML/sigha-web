export interface VirtualFile {
  id: number;
  patientId: number;
  patientName: string;
  admissionDate: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  vaccinations: string;
  functionalAssessment: string;
  cognitiveAssessment: string;
  psychosocialAssessment: string;
  careNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVirtualFileData {
  patientName: string;
  admissionDate: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  vaccinations?: string;
  functionalAssessment?: string;
  cognitiveAssessment?: string;
  psychosocialAssessment?: string;
  careNotes?: string;
}

export interface UpdateVirtualFileData extends Partial<CreateVirtualFileData> {}

export interface VirtualFileSearchParams {
  name?: string;
  gender?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VirtualFileApiResponse {
  data: VirtualFile[];
  total: number;
  page: number;
  limit: number;
}
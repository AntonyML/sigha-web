export type MemoVisibility = 'public' | 'clinical' | 'confidential';
export type MemoStatus = 'open' | 'in_progress' | 'resolved' | 'archived';
export type MemoUrgency = 'routine' | 'priority' | 'urgent';
export type MemoCategory = 'general' | 'referral' | 'clinical_note' | 'administrative' | 'follow_up';

export interface MemoAttachment {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

export interface ResidentMemo {
  id: number;
  olderAdultId: number;
  authorId: number;
  authorName?: string;
  authorRole?: string;
  targetUserId?: number | null;
  targetUserName?: string | null;
  targetRoleId?: number | null;
  targetRoleName?: string | null;
  parentMemoId?: number | null;
  content: string;
  category: MemoCategory;
  visibility: MemoVisibility;
  status: MemoStatus;
  urgency: MemoUrgency;
  attachments: MemoAttachment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: ResidentMemo[];
}

export interface CreateMemoPayload {
  olderAdultId: number;
  content: string;
  category?: MemoCategory;
  visibility?: MemoVisibility;
  urgency?: MemoUrgency;
  targetUserId?: number | null;
  targetRoleId?: number | null;
  parentMemoId?: number | null;
  attachments?: MemoAttachment[];
}

export interface MemoTagOption {
  id: number;
  label: string;
  type: 'user' | 'role';
  roleName?: string;
}

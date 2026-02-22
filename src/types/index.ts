// Using string types since SQLite doesn't support enums
export type MemberRole = string;
export type FieldType = string;
export type Priority = string;
export type CardStatus = string;
export type ActivityType = string;
export type AutomationTrigger = string;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  members?: OrganizationMember[];
  pipes?: Pipe[];
}

export interface OrganizationMember {
  id: string;
  role: MemberRole;
  createdAt: Date;
  userId: string;
  organizationId: string;
  user?: User;
  organization?: Organization;
}

export interface Pipe {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  phases?: Phase[];
  fields?: Field[];
  cards?: Card[];
  _count?: {
    cards: number;
    phases: number;
  };
}

export interface Phase {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  order: number;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
  pipeId: string;
  cards?: Card[];
  _count?: {
    cards: number;
  };
}

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string | null;
  options?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  pipeId: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority: Priority;
  status: CardStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  pipeId: string;
  phaseId: string;
  createdById: string;
  phase?: Phase;
  createdBy?: User;
  assignees?: CardAssignee[];
  fieldValues?: FieldValue[];
  comments?: Comment[];
  activities?: Activity[];
  attachments?: Attachment[];
  labels?: CardLabel[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface CardAssignee {
  id: string;
  cardId: string;
  userId: string;
  createdAt: Date;
  user?: User;
}

export interface FieldValue {
  id: string;
  value?: string | null;
  cardId: string;
  fieldId: string;
  createdAt: Date;
  updatedAt: Date;
  field?: Field;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  cardId: string;
  authorId: string;
  author?: User;
}

export interface Activity {
  id: string;
  type: ActivityType;
  data?: string | null;
  createdAt: Date;
  cardId: string;
  userId: string;
  user?: User;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  cardId: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface CardLabel {
  cardId: string;
  labelId: string;
  label?: Label;
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions?: string | null;
  actions: string;
  createdAt: Date;
  updatedAt: Date;
  pipeId: string;
}

export type KanbanPhase = Phase & {
  cards: Card[];
  _count: { cards: number };
};

export interface DashboardStats {
  totalPipes: number;
  totalCards: number;
  overdueCards: number;
  completedCards: number;
}

export type EntityId = string | number;

export type RecordStatus = 'active' | 'inactive';

export interface Auditable {
  createdAt: string;
  updatedAt: string;
}

export interface NamedEntity {
  id: EntityId;
  name: string;
}

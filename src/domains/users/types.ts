import type { AuthenticatedRole } from '@/core/auth/roles';
import type { Auditable, EntityId } from '../shared';

export interface AppUser extends Auditable {
  id: EntityId;
  email: string;
  name: string;
  roles: AuthenticatedRole[];
  personId?: EntityId;
  isActive: boolean;
  pictureUrl?: string;
  phone?: string;
  address?: string;
}

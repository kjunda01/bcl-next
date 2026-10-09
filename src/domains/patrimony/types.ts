import type { Auditable, EntityId } from '../shared';
import type { InstrumentDetails } from '../instruments/types';

export type PatrimonyCategory = 'instrument' | 'uniform' | 'equipment' | 'furniture' | 'other';

export type PatrimonyStatus = 'available' | 'in_use' | 'maintenance' | 'retired';

export interface PatrimonyItem extends Auditable {
  id: EntityId;
  code: string;
  name: string;
  category: PatrimonyCategory;
  acquisitionDate: string;
  acquisitionValue?: number;
  status: PatrimonyStatus;
  location?: string;
  notes?: string;
  photoUrl?: string;
  assignedPersonId?: EntityId;
  instrument?: InstrumentDetails;
}

export function isInstrumentItem(item: PatrimonyItem): item is PatrimonyItem & { instrument: InstrumentDetails } {
  return item.category === 'instrument' && Boolean(item.instrument);
}

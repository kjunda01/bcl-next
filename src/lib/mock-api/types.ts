import type seed from '../../../db.json';

export type MockDb = typeof seed;

export type MockCollection = keyof MockDb;

export const MOCK_COLLECTIONS: MockCollection[] = [
  'users',
  'people',
  'songs',
  'patrimony',
  'presentations',
  'media',
];

export type MockRecord = Record<string, unknown> & { id: string };

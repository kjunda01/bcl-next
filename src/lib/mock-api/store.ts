import seed from '../../../db.json';
import type { MockCollection, MockDb, MockRecord } from './types';

const globalStore = globalThis as typeof globalThis & {
  __bclMockDb?: MockDb;
};

function cloneSeed(): MockDb {
  return structuredClone(seed) as MockDb;
}

/** Banco em memória (persiste enquanto a instância serverless estiver quente). */
export function getMockDb(): MockDb {
  if (!globalStore.__bclMockDb) {
    globalStore.__bclMockDb = cloneSeed();
  } else {
    if (!Array.isArray(globalStore.__bclMockDb.homepage)) {
      globalStore.__bclMockDb.homepage = structuredClone(seed.homepage);
    }
    if (!Array.isArray(globalStore.__bclMockDb.blogpage)) {
      globalStore.__bclMockDb.blogpage = structuredClone(seed.blogpage);
    }
  }
  return globalStore.__bclMockDb;
}

export function getCollection(name: MockCollection): MockRecord[] {
  const db = getMockDb();
  const rows = db[name];
  if (!Array.isArray(rows)) {
    throw new Error(`Coleção inválida: ${name}`);
  }
  return rows as MockRecord[];
}

export function isMockCollection(name: string): name is MockCollection {
  return name in seed;
}

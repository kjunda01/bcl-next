import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { MOCK_COLLECTIONS, type MockCollection, type MockDb, type MockRecord } from './types';

const seedPath = path.join(process.cwd(), 'src/domains/seed/mock-api.json');

const globalStore = globalThis as typeof globalThis & {
  __bclMockDb?: MockDb;
};

function readSeedFile(): MockDb {
  return JSON.parse(readFileSync(seedPath, 'utf8')) as MockDb;
}

/** Banco em memória. Na primeira leitura, carrega o mock-api.json. */
export function getMockDb(): MockDb {
  if (!globalStore.__bclMockDb) {
    globalStore.__bclMockDb = readSeedFile();
  }
  return globalStore.__bclMockDb;
}

let writeChain = Promise.resolve();

/** Grava o estado atual no seed para a alteração da tela permanecer no arquivo. */
export function persistMockDb(): Promise<void> {
  const body = `${JSON.stringify(getMockDb(), null, 2)}\n`;
  const task = writeChain.then(() => writeFile(seedPath, body, 'utf8'));
  writeChain = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
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
  return (MOCK_COLLECTIONS as string[]).includes(name);
}

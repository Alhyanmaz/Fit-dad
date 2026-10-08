import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dossierDeSortie } from './sortie';

function fauxDepot(): string {
  const depot = mkdtempSync(join(tmpdir(), 'fit-dad-'));
  mkdirSync(join(depot, 'data'));
  writeFileSync(join(depot, 'data', 'programme.json'), '{}');
  mkdirSync(join(depot, 'app'));
  return join(depot, 'app');
}

describe('dossierDeSortie', () => {
  it('accepte <dépôt>/v2', () => {
    const app = fauxDepot();
    expect(dossierDeSortie(app)).toBe(join(app, '..', 'v2'));
  });

  it('refuse la racine du dépôt, qui serait vidée', () => {
    expect(() => dossierDeSortie(fauxDepot(), '..')).toThrow(/refusé/);
  });

  it('refuse un sous-dossier ou un autre nom', () => {
    const app = fauxDepot();
    expect(() => dossierDeSortie(app, '../v2/sous-dossier')).toThrow(/refusé/);
    expect(() => dossierDeSortie(app, '../dist')).toThrow(/refusé/);
  });

  it('refuse un dossier qui ne ressemble pas au dépôt', () => {
    const ailleurs = join(mkdtempSync(join(tmpdir(), 'autre-')), 'app');
    expect(() => dossierDeSortie(ailleurs)).toThrow(/ne ressemble pas/);
  });
});

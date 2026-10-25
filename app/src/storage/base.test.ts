import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { journalVide } from '../domain/journal';
import { Base, ecrireJour, ecrireReglages, lireHistorique, lireJour, lireReglages } from './base';

let base: Base;
afterEach(async () => {
  await base.delete();
});

describe('enregistrement sur le téléphone (docs/SPEC.md §7.2)', () => {
  it('réglages : rien au premier lancement, puis le niveau gardé', async () => {
    base = new Base('test-reglages');
    expect(await lireReglages(base)).toBeNull();
    await ecrireReglages(base, { niveau: { ancrage: 'N0' }, depuis: '2026-10-26', historique: [] });
    expect(await lireReglages(base)).toEqual({
      cle: 'reglages',
      niveau: { ancrage: 'N0' },
      depuis: '2026-10-26',
      historique: [],
    });
  });

  it('journal : une entrée par date, relue à l’identique ; un jour vide sinon', async () => {
    base = new Base('test-journal');
    const jour = {
      ...journalVide(),
      faits: { 'matin:rings_row': true },
      repetitions: { 'matin:rings_row': [12] },
      lettreFaite: 'A' as const,
      tenu: true,
    };
    await ecrireJour(base, '2026-10-26', jour);
    expect(await lireJour(base, '2026-10-26')).toEqual(jour);
    expect(await lireJour(base, '2026-10-27')).toEqual(journalVide());
  });

  it('historique : les dates demandées seulement, dans l’ordre', async () => {
    base = new Base('test-historique');
    for (const date of ['2026-10-25', '2026-10-26', '2026-10-28', '2026-11-09'])
      await ecrireJour(base, date, { ...journalVide(), tenu: true });
    const h = await lireHistorique(base, '2026-10-26', '2026-11-08');
    expect(h.map((e) => e.date)).toEqual(['2026-10-26', '2026-10-28']);
  });

  it('une entrée d’un format plus ancien est complétée', async () => {
    base = new Base('test-ancien');
    const ancien: Partial<ReturnType<typeof journalVide>> = journalVide();
    delete ancien.tenu;
    delete ancien.lettreFaite;
    await base.journal.put({ ...(ancien as ReturnType<typeof journalVide>), date: '2026-10-26' });
    const relu = await lireJour(base, '2026-10-26');
    expect([relu.tenu, relu.lettreFaite]).toEqual([false, null]);
  });
});

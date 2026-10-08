import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Dossier de sortie du build : toujours `<dépôt>/v2`.
 *
 * Le build vide ce dossier avant d'écrire (`emptyOutDir`). Une erreur de chemin
 * (par exemple `..`) effacerait le dépôt : on refuse donc tout autre emplacement.
 */
export function dossierDeSortie(dossierApp: string, sortie = '../v2'): string {
  const depot = dirname(resolve(dossierApp));
  const attendu = join(depot, 'v2');
  const demande = resolve(dossierApp, sortie);
  if (demande !== attendu) {
    throw new Error(`Dossier de sortie refusé : ${demande} (attendu : ${attendu}).`);
  }
  if (!existsSync(join(depot, 'data', 'programme.json'))) {
    throw new Error(`Dossier de sortie refusé : ${depot} ne ressemble pas au dépôt Fit-dad.`);
  }
  return demande;
}

/**
 * Les 3 compteurs animés de l'accueil (et dupliqués sur About/Équipe), aujourd'hui
 * codés en dur 3 fois dans le front (home/about/team .html) : `<app-stat-counter
 * [to]="2193" suffix="+" />` etc. `key` correspond au label i18n déjà existant
 * (common.stats.sitesDelivered / projectValue / assetValue) — le texte du libellé
 * reste géré par Transloco côté front, le BO ne pilote que value/decimals/suffix.
 */
export type HomeStatKey = 'sites_delivered' | 'project_value' | 'asset_value';

export interface HomeStat {
  key: HomeStatKey;
  label: string;
  value: number;
  decimals: number;
  suffix: string;
}

export const HOME_STAT_DEFAULTS: HomeStat[] = [
  { key: 'sites_delivered', label: 'Chantiers livrés', value: 2193, decimals: 0, suffix: '+' },
  { key: 'project_value', label: 'Valeur des projets', value: 3.16, decimals: 2, suffix: ' M€' },
  { key: 'asset_value', label: 'Valeur des actifs', value: 121.2, decimals: 1, suffix: ' M€' },
];

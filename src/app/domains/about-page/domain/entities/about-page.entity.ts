/**
 * Contenu propre à la page /a-propos du site vitrine — le bloc "Bienvenue chez ATHL" (onglets,
 * AUSSI affiché sur l'accueil : même donnée aux deux endroits, pas de copie), en-têtes de
 * section, les 3 cartes "Nos 3 métiers" (texte et image indépendants des onglets et de
 * Service, même si tout se ressemble), "Nos équipes terrain" et "Ce qui nous engage".
 * N'inclut PAS la grille des membres (reste sur Team, partagée avec /equipe).
 * Jeu de données fixe (1 enregistrement) : un seul GET, un seul PUT.
 */
export interface AboutWorkforceStat {
  labelFr: string;
  labelEn: string;
  value: number;
  decimals: number;
  suffix: string;
}

export interface AboutWorkforceTab {
  number: string;
  titleFr: string;
  titleEn: string;
  image: string;
  heroImage: string;
  leadFr: string;
  leadEn: string;
  bullet1Fr: string;
  bullet1En: string;
  bullet2Fr: string;
  bullet2En: string;
  bullet3Fr: string;
  bullet3En: string;
  bullet4Fr: string;
  bullet4En: string;
  stats: AboutWorkforceStat[];
}

export interface AboutPillar {
  titleFr: string;
  titleEn: string;
  image: string;
  bullet1Fr: string;
  bullet1En: string;
  bullet2Fr: string;
  bullet2En: string;
  bullet3Fr: string;
  bullet3En: string;
  bullet4Fr: string;
  bullet4En: string;
}

export interface AboutGroundRole {
  labelFr: string;
  labelEn: string;
}

export interface AboutCommitment {
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
}

export interface AboutValue {
  labelFr: string;
  labelEn: string;
  textFr: string;
  textEn: string;
}

export interface AboutPageContent {
  workforceEyebrowFr: string;
  workforceEyebrowEn: string;
  workforceTitleFr: string;
  workforceTitleEn: string;
  workforceLeadFr: string;
  workforceLeadEn: string;
  workforceTabs: AboutWorkforceTab[];

  heroEyebrowFr: string;
  heroEyebrowEn: string;
  heroTitleFr: string;
  heroTitleEn: string;
  heroLeadFr: string;
  heroLeadEn: string;

  pillarsEyebrowFr: string;
  pillarsEyebrowEn: string;
  pillarsTitleFr: string;
  pillarsTitleEn: string;
  pillarsLeadFr: string;
  pillarsLeadEn: string;
  pillars: AboutPillar[];

  teamEyebrowFr: string;
  teamEyebrowEn: string;
  teamTitleFr: string;
  teamTitleEn: string;
  teamLeadFr: string;
  teamLeadEn: string;

  groundTitleFr: string;
  groundTitleEn: string;
  groundLeadFr: string;
  groundLeadEn: string;
  groundCtaLabelFr: string;
  groundCtaLabelEn: string;
  groundImages: string[];
  groundRoles: AboutGroundRole[];
  commitments: AboutCommitment[];

  valuesTitleFr: string;
  valuesTitleEn: string;
  valuesBackgroundImage: string;
  values: AboutValue[];
}

export function emptyAboutWorkforceStat(): AboutWorkforceStat {
  return { labelFr: '', labelEn: '', value: 0, decimals: 0, suffix: '' };
}

export function emptyAboutWorkforceTab(order: number): AboutWorkforceTab {
  return {
    number: String(order).padStart(2, '0'), titleFr: '', titleEn: '', image: '', heroImage: '',
    leadFr: '', leadEn: '',
    bullet1Fr: '', bullet1En: '', bullet2Fr: '', bullet2En: '',
    bullet3Fr: '', bullet3En: '', bullet4Fr: '', bullet4En: '',
    stats: [emptyAboutWorkforceStat(), emptyAboutWorkforceStat(), emptyAboutWorkforceStat()],
  };
}

export function emptyAboutPillar(): AboutPillar {
  return {
    titleFr: '', titleEn: '', image: '',
    bullet1Fr: '', bullet1En: '', bullet2Fr: '', bullet2En: '',
    bullet3Fr: '', bullet3En: '', bullet4Fr: '', bullet4En: '',
  };
}

export function emptyAboutGroundRole(): AboutGroundRole {
  return { labelFr: '', labelEn: '' };
}

export function emptyAboutCommitment(): AboutCommitment {
  return { titleFr: '', titleEn: '', textFr: '', textEn: '' };
}

export function emptyAboutValue(): AboutValue {
  return { labelFr: '', labelEn: '', textFr: '', textEn: '' };
}

export const ABOUT_PAGE_DEFAULTS: AboutPageContent = {
  workforceEyebrowFr: '', workforceEyebrowEn: '', workforceTitleFr: '', workforceTitleEn: '', workforceLeadFr: '', workforceLeadEn: '',
  workforceTabs: [emptyAboutWorkforceTab(1), emptyAboutWorkforceTab(2), emptyAboutWorkforceTab(3)],
  heroEyebrowFr: '', heroEyebrowEn: '', heroTitleFr: '', heroTitleEn: '', heroLeadFr: '', heroLeadEn: '',
  pillarsEyebrowFr: '', pillarsEyebrowEn: '', pillarsTitleFr: '', pillarsTitleEn: '', pillarsLeadFr: '', pillarsLeadEn: '',
  pillars: [emptyAboutPillar(), emptyAboutPillar(), emptyAboutPillar()],
  teamEyebrowFr: '', teamEyebrowEn: '', teamTitleFr: '', teamTitleEn: '', teamLeadFr: '', teamLeadEn: '',
  groundTitleFr: '', groundTitleEn: '', groundLeadFr: '', groundLeadEn: '', groundCtaLabelFr: '', groundCtaLabelEn: '',
  groundImages: [],
  groundRoles: [emptyAboutGroundRole(), emptyAboutGroundRole(), emptyAboutGroundRole(), emptyAboutGroundRole()],
  commitments: [emptyAboutCommitment(), emptyAboutCommitment(), emptyAboutCommitment()],
  valuesTitleFr: '', valuesTitleEn: '', valuesBackgroundImage: '',
  values: [emptyAboutValue(), emptyAboutValue(), emptyAboutValue(), emptyAboutValue()],
};

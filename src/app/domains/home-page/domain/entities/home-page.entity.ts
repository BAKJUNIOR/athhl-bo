// Reprend les champs attendus par HomePageContent côté Athl_logistics-front
// (domains/vitrine/infrastructure/data/home-page.data.ts). Icône et titre des 3 cartes pilier
// restent fixes côté front (3 emplacements par position) — seuls le texte et l'image sont
// éditables ici, propres à cette page (pas liés à Service ni aux cartes de la page À propos).
export interface HomePageContent {
  heroTitleLine1Fr: string;
  heroTitleLine1En: string;
  heroTitleLine2Fr: string;
  heroTitleLine2En: string;
  heroSubtitleFr: string;
  heroSubtitleEn: string;
  heroImages: string[];

  pillarConstructionLeadFr: string;
  pillarConstructionLeadEn: string;
  pillarConstructionImage: string;

  pillarMobilityLeadFr: string;
  pillarMobilityLeadEn: string;
  pillarMobilityImage: string;

  pillarImportLeadFr: string;
  pillarImportLeadEn: string;
  pillarImportImage: string;
}

export function emptyHomePageContent(): HomePageContent {
  return {
    heroTitleLine1Fr: '',
    heroTitleLine1En: '',
    heroTitleLine2Fr: '',
    heroTitleLine2En: '',
    heroSubtitleFr: '',
    heroSubtitleEn: '',
    heroImages: [],
    pillarConstructionLeadFr: '',
    pillarConstructionLeadEn: '',
    pillarConstructionImage: '',
    pillarMobilityLeadFr: '',
    pillarMobilityLeadEn: '',
    pillarMobilityImage: '',
    pillarImportLeadFr: '',
    pillarImportLeadEn: '',
    pillarImportImage: '',
  };
}

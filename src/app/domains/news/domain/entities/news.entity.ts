export type NewsStatus = 'draft' | 'published';

export function newsStatusLabel(status: NewsStatus): string {
  return status === 'published' ? 'Publié' : 'Brouillon';
}

/**
 * Reprend les champs attendus par `NewsItem` côté Athl_logistics-front
 * (domains/vitrine/infrastructure/data/news.data.ts). `bodyFr`/`bodyEn` sont le texte complet de
 * l'article, paragraphes séparés par une ligne vide — c'est le front qui les redécoupe pour
 * l'affichage (même convention que Project.descriptionFr/En). La citation est optionnelle :
 * laisser les champs quote* vides si l'article n'en a pas.
 */
export interface NewsArticle {
  id: number;
  slug: string;
  image: string;
  date: string;
  featured: boolean;
  categoryFr: string;
  categoryEn: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  bodyFr: string;
  bodyEn: string;
  quoteTextFr: string;
  quoteTextEn: string;
  quoteNameFr: string;
  quoteNameEn: string;
  quoteRoleFr: string;
  quoteRoleEn: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  status: NewsStatus;
  updatedAt: string;
}

// Le slug est généré une seule fois par le backend à la création (voir Athl_logistics-backend,
// NewsArticleServiceImpl) et reste ensuite immuable : le BO ne l'édite jamais, il l'affiche seulement.
export type NewsUpsertRequest = Omit<NewsArticle, 'id' | 'slug' | 'updatedAt'>;

export function emptyNewsForm(): NewsUpsertRequest {
  return {
    image: '',
    date: '',
    featured: false,
    categoryFr: '',
    categoryEn: '',
    titleFr: '',
    titleEn: '',
    excerptFr: '',
    excerptEn: '',
    bodyFr: '',
    bodyEn: '',
    quoteTextFr: '',
    quoteTextEn: '',
    quoteNameFr: '',
    quoteNameEn: '',
    quoteRoleFr: '',
    quoteRoleEn: '',
    facebookUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    status: 'draft',
  };
}

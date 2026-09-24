/**
 * Reprend les champs saisis dans le formulaire "Demander un devis" du front
 * (domains/vitrine/presentation/pages/quote/quote.component.ts) : Service, Nom,
 * Téléphone, Description, Documents. C'est une soumission de visiteur, pas un
 * contenu éditorial — le BO ne fait qu'en suivre le traitement via `status`.
 */
export type QuoteRequestStatus = 'new' | 'in_progress' | 'done';

export function quoteStatusLabel(status: QuoteRequestStatus): string {
  switch (status) {
    case 'new':
      return 'Nouvelle';
    case 'in_progress':
      return 'En cours';
    case 'done':
      return 'Traitée';
  }
}

export interface QuoteRequest {
  id: number;
  serviceLabel: string;
  name: string;
  phone: string;
  description: string;
  attachments: string[];
  status: QuoteRequestStatus;
  receivedAt: string;
}

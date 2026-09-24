/**
 * Reprend les champs saisis dans le formulaire de candidature du front
 * (domains/vitrine/presentation/pages/careers/careers.component.ts) : Nom, Téléphone,
 * E-mail, Poste, Expérience, Ville, Message, CV. Soumission de visiteur, pas un
 * contenu éditorial — le BO ne fait qu'en suivre le traitement via `status`.
 */
export type ApplicationStatus = 'new' | 'in_progress' | 'done';

export function applicationStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'new':
      return 'Nouvelle';
    case 'in_progress':
      return 'En cours';
    case 'done':
      return 'Traitée';
  }
}

export interface JobApplication {
  id: number;
  position: string;
  name: string;
  phone: string;
  email: string;
  experience: string;
  city: string;
  message: string;
  cvUrl: string;
  status: ApplicationStatus;
  receivedAt: string;
}

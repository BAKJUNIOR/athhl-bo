export type NotificationCategory = 'quote' | 'application' | 'content' | 'system';

export function notificationCategoryLabel(category: NotificationCategory): string {
  switch (category) {
    case 'quote':
      return 'Devis';
    case 'application':
      return 'Candidature';
    case 'content':
      return 'Contenu';
    case 'system':
      return 'Système';
  }
}

export interface AppNotification {
  id: number;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  path: string;
}

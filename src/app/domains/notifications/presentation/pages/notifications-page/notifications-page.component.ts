import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { SafeHtmlPipe } from '../../../../../shared/pipe/safe-html.pipe';
import { AppNotification, NotificationCategory, notificationCategoryLabel } from '../../../domain/entities/notification.entity';

interface NotificationGroup {
  label: string;
  items: AppNotification[];
}

const CATEGORY_STYLE: Record<NotificationCategory, { bg: string; text: string; icon: string }> = {
  quote: {
    bg: 'bg-brand-50 dark:bg-brand-500/10',
    text: 'text-brand-500',
    icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6l9 7 9-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  application: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  content: {
    bg: 'bg-blue-light-50 dark:bg-blue-light-500/10',
    text: 'text-blue-light-500',
    icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  system: {
    bg: 'bg-gray-100 dark:bg-white/5',
    text: 'text-gray-500 dark:text-gray-400',
    icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.75 2.29a1 1 0 00-1.5 0v.55A6.75 6.75 0 003.63 9.5v5.29h-.3a.83.83 0 000 1.67h13.34a.83.83 0 000-1.67h-.3V9.5A6.75 6.75 0 0010.75 2.84v-.55z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 17.7a1.5 1.5 0 003 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
};

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PageBreadcrumbComponent, ComponentCardComponent, ButtonComponent, SafeHtmlPipe],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent {
  notifications = signal<AppNotification[]>([]);
  onlyUnread = signal(false);

  categoryLabel = notificationCategoryLabel;

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  readonly filtered = computed(() => {
    const list = this.notifications();
    return this.onlyUnread() ? list.filter((n) => !n.read) : list;
  });

  readonly groups = computed<NotificationGroup[]>(() => {
    const list = this.filtered();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86_400_000;

    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const older: AppNotification[] = [];

    for (const n of list) {
      const t = new Date(n.createdAt).getTime();
      if (t >= startOfToday) today.push(n);
      else if (t >= startOfYesterday) yesterday.push(n);
      else older.push(n);
    }

    return [
      { label: "Aujourd'hui", items: today },
      { label: 'Hier', items: yesterday },
      { label: 'Plus ancien', items: older },
    ].filter((g) => g.items.length > 0);
  });

  style(category: NotificationCategory) {
    return CATEGORY_STYLE[category];
  }

  formatTime(iso: string): string {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `il y a ${diffH} h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  markAllAsRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  open(n: AppNotification): void {
    if (!n.read) {
      this.notifications.update((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
  }
}

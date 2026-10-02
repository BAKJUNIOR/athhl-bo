import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BadgeComponent } from '../../../../../../shared/ui/badge/badge.component';
import { SafeHtmlPipe } from '../../../../../../shared/pipe/safe-html.pipe';
import { DashboardStatsApi, DashboardSummary } from '../../../../infrastructure/api/dashboard-stats.api';

type KpiStatus = 'action' | 'ok';

interface Kpi {
  name: string;
  section: string;
  value: string;
  status: KpiStatus;
  statusLabel: string;
  icon: string;
  path: string;
}

const mailIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 6l9 7 9-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const fileIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const wrenchIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const briefcaseIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a1 1 0 00-1 1v11a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM9 5h6v2H9V5zm11 14a1 1 0 01-1 1H5a1 1 0 01-1-1V9h16v10zM9 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const teamIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const usersIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

@Component({
  selector: 'app-recent-orders',
  imports: [BadgeComponent, RouterModule, SafeHtmlPipe],
  templateUrl: './recent-orders.component.html',
})
export class RecentOrdersComponent implements OnInit {
  private readonly dashboardStatsApi = inject(DashboardStatsApi);

  // Alimenté dans ngOnInit via DashboardStatsApi (voir domains/quotes, applications,
  // services, jobs, team, user — mêmes sources que les boîtes de réception/pages de contenu).
  // Signal, pas un simple champ : l'app tourne sans zone.js (voir package.json), une mutation
  // de champ brut dans un callback RxJS ne déclenche pas de rafraîchissement de la vue.
  kpis = signal<Kpi[]>([]);

  ngOnInit(): void {
    this.dashboardStatsApi.getSummary().subscribe((summary) => {
      this.kpis.set(this.buildKpis(summary));
    });
  }

  private buildKpis(s: DashboardSummary): Kpi[] {
    return [
      {
        name: 'Demandes de devis', section: 'Demandes reçues', icon: mailIcon, path: '/quotes',
        value: `${s.newQuotesCount} ${s.newQuotesCount > 1 ? 'nouvelles' : 'nouvelle'}`,
        status: s.newQuotesCount > 0 ? 'action' : 'ok',
        statusLabel: s.newQuotesCount > 0 ? 'À traiter' : 'À jour',
      },
      {
        name: 'Candidatures', section: 'Demandes reçues', icon: fileIcon, path: '/applications',
        value: `${s.newApplicationsCount} ${s.newApplicationsCount > 1 ? 'nouvelles' : 'nouvelle'}`,
        status: s.newApplicationsCount > 0 ? 'action' : 'ok',
        statusLabel: s.newApplicationsCount > 0 ? 'À traiter' : 'À jour',
      },
      {
        name: 'Services', section: 'Contenu du site', icon: wrenchIcon, path: '/services',
        value: `${s.draftServicesCount} ${s.draftServicesCount > 1 ? 'brouillons' : 'brouillon'}`,
        status: s.draftServicesCount > 0 ? 'action' : 'ok',
        statusLabel: s.draftServicesCount > 0 ? 'À publier' : 'À jour',
      },
      {
        name: "Offres d'emploi", section: 'Carrières', icon: briefcaseIcon, path: '/jobs',
        value: `${s.activeJobsCount} ${s.activeJobsCount > 1 ? 'actives' : 'active'}`,
        status: 'ok', statusLabel: 'À jour',
      },
      {
        name: 'Équipe', section: 'Contenu du site', icon: teamIcon, path: '/team',
        value: `${s.teamMembersCount} ${s.teamMembersCount > 1 ? 'membres' : 'membre'}`,
        status: 'ok', statusLabel: 'À jour',
      },
      {
        name: 'Utilisateurs du BO', section: 'Administration', icon: usersIcon, path: '/users',
        value: `${s.activeUsersCount} ${s.activeUsersCount > 1 ? 'actifs' : 'actif'}`,
        status: 'ok', statusLabel: 'À jour',
      },
    ];
  }

  badgeColor(status: KpiStatus): 'warning' | 'success' {
    return status === 'action' ? 'warning' : 'success';
  }
}

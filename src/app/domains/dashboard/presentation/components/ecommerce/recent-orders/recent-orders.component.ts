import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BadgeComponent } from '../../../../../../shared/ui/badge/badge.component';
import { SafeHtmlPipe } from '../../../../../../shared/pipe/safe-html.pipe';

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
export class RecentOrdersComponent {
  // Chiffres d'exemple en attendant que ces sections soient alimentées par de vraies
  // données (voir domains/quotes, applications, services, jobs, team, user).
  kpis: Kpi[] = [
    { name: 'Demandes de devis', section: 'Demandes reçues', value: '6 nouvelles', status: 'action', statusLabel: 'À traiter', icon: mailIcon, path: '/quotes' },
    { name: 'Candidatures', section: 'Demandes reçues', value: '4 nouvelles', status: 'action', statusLabel: 'À traiter', icon: fileIcon, path: '/applications' },
    { name: 'Services', section: 'Contenu du site', value: '2 brouillons', status: 'action', statusLabel: 'À publier', icon: wrenchIcon, path: '/services' },
    { name: "Offres d'emploi", section: 'Carrières', value: '3 actives', status: 'ok', statusLabel: 'À jour', icon: briefcaseIcon, path: '/jobs' },
    { name: 'Équipe', section: 'Contenu du site', value: '3 membres', status: 'ok', statusLabel: 'À jour', icon: teamIcon, path: '/team' },
    { name: 'Utilisateurs du BO', section: 'Administration', value: '5 actifs', status: 'ok', statusLabel: 'À jour', icon: usersIcon, path: '/users' },
  ];

  badgeColor(status: KpiStatus): 'warning' | 'success' {
    return status === 'action' ? 'warning' : 'success';
  }
}

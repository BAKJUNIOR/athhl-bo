
import { Component, OnInit, inject, signal } from '@angular/core';
import { NgApexchartsModule, ApexNonAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexStroke, ApexLegend, ApexFill, ApexTooltip, ApexStates } from 'ng-apexcharts';
import { DropdownComponent } from '../../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';
import { DashboardStatsApi } from '../../../../infrastructure/api/dashboard-stats.api';

interface Slice {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-monthly-sales-chart',
  standalone: true,
  imports: [
    NgApexchartsModule,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './monthly-sales-chart.component.html'
})
export class MonthlySalesChartComponent implements OnInit {
  private readonly dashboardStatsApi = inject(DashboardStatsApi);

  // Répartition des demandes reçues ce mois-ci entre devis et candidatures (voir
  // DashboardStatsApi) — mis à jour dans ngOnInit, les valeurs de départ sont juste le repli
  // avant que l'appel réseau aboutisse. Signaux, pas de simples champs : l'app tourne sans
  // zone.js (voir package.json), une mutation de champ brut dans un callback RxJS ne déclenche
  // pas de rafraîchissement de la vue (ni de la vue, ni de l'input [series] du <apx-chart>).
  slices = signal<Slice[]>([
    { label: 'Demandes de devis', value: 0, color: '#f97316' },
    { label: 'Candidatures', value: 0, color: '#5d4392' },
  ]);

  total = signal(0);

  public series = signal<ApexNonAxisChartSeries>([0, 0]);
  public labels: string[] = ['Demandes de devis', 'Candidatures'];
  public colors: string[] = ['#f97316', '#5d4392'];

  ngOnInit(): void {
    this.dashboardStatsApi.getSummary().subscribe((summary) => {
      const slices: Slice[] = [
        { label: 'Demandes de devis', value: summary.quotesThisMonth, color: '#f97316' },
        { label: 'Candidatures', value: summary.applicationsThisMonth, color: '#5d4392' },
      ];
      this.slices.set(slices);
      this.total.set(slices.reduce((sum, s) => sum + s.value, 0));
      this.series.set(slices.map((s) => s.value));
    });
  }

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    type: 'donut',
    height: 440,
    toolbar: { show: false },
    dropShadow: {
      enabled: true,
      top: 4,
      left: 0,
      blur: 12,
      opacity: 0.12,
    },
  };
  public plotOptions: ApexPlotOptions = {
    pie: {
      expandOnClick: false,
      donut: {
        size: '64%',
        labels: {
          show: true,
          name: { show: true, fontSize: '15px', fontWeight: 500, color: '#98A2B3', offsetY: 32 },
          value: {
            show: true,
            fontSize: '46px',
            fontWeight: 700,
            color: '#101828',
            offsetY: -14,
            formatter: (val: string) => val,
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '15px',
            fontWeight: 500,
            color: '#98A2B3',
            formatter: () => `${this.total()}`,
          },
        },
      },
    },
  };
  public dataLabels: ApexDataLabels = { enabled: false };
  public stroke: ApexStroke = { show: true, width: 3, colors: ['#fff'] };
  public states: ApexStates = {
    hover: { filter: { type: 'darken' } },
  };
  public legend: ApexLegend = { show: false };
  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'diagonal1',
      shadeIntensity: 0.25,
      gradientToColors: this.colors,
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 0.85,
    },
  };
  public tooltip: ApexTooltip = {
    style: { fontSize: '16px', fontFamily: 'Outfit, sans-serif' },
    y: { formatter: (val: number) => `${val}` },
  };

  isOpen = false;

  percentage(value: number): number {
    const total = this.total();
    return total ? Math.round((value / total) * 100) : 0;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}

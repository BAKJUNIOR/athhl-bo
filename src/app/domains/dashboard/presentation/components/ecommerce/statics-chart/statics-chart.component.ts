
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { ChartTabComponent } from '../../common/chart-tab/chart-tab.component';
import { DashboardStatsApi } from '../../../../infrastructure/api/dashboard-stats.api';

@Component({
  selector: 'app-statics-chart',
  imports: [NgApexchartsModule, ChartTabComponent],
  templateUrl: './statics-chart.component.html',
})
export class StatisticsChartComponent implements AfterViewInit, OnInit {
  private readonly dashboardStatsApi = inject(DashboardStatsApi);

  @ViewChild('datepicker') datepicker!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.dashboardStatsApi.getSummary().subscribe((summary) => {
      this.series.set([
        { name: 'Demandes de devis', data: summary.quotesByMonth },
        { name: 'Candidatures', data: summary.applicationsByMonth },
      ]);
    });
  }

  ngAfterViewInit() {
    flatpickr(this.datepicker.nativeElement, {
      mode: 'range',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'M j',
      defaultDate: [new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()],
      onReady: (selectedDates: Date[], dateStr: string, instance: Instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
        const customClass = instance.element.getAttribute('data-class');
        instance.calendarContainer?.classList.add(customClass!);
      },
      onChange: (selectedDates: Date[], dateStr: string, instance: Instance) => {
        (instance.element as HTMLInputElement).value = dateStr.replace('to', '-');
      },
    });
  }
  // Demandes de devis/candidatures reçues mois par mois (année en cours) — mis à jour dans
  // ngOnInit via DashboardStatsApi, vide le temps que l'appel réseau aboutisse. Signal, pas un
  // simple champ : l'app tourne sans zone.js (voir package.json), une mutation de champ brut
  // dans un callback RxJS ne déclenche pas la mise à jour de l'input [series] du <apx-chart>.
  public series = signal<ApexAxisChartSeries>([
    { name: 'Demandes de devis', data: [] },
    { name: 'Candidatures', data: [] },
  ]);

  public chart: ApexChart = {
    fontFamily: 'Outfit, sans-serif',
    height: 310,
    type: 'area',
    toolbar: { show: false },
  };

  public colors: string[] = ['#f97316', '#5d4392'];

  public stroke: ApexStroke = {
    curve: 'straight',
    width: [2, 2],
  };

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  };

  public markers: ApexMarkers = {
    size: 0,
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 6 },
  };

  public grid: ApexGrid = {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  };

  public dataLabels: ApexDataLabels = { enabled: false };

  public tooltip: ApexTooltip = {
    enabled: true,
    x: { format: 'dd MMM yyyy' },
  };

  public xaxis: ApexXAxis = {
    type: 'category',
    categories: [
      'Janv',
      'Févr',
      'Mars',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sept',
      'Oct',
      'Nov',
      'Déc',
    ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  };

  public yaxis: ApexYAxis = {
    labels: {
      style: {
        fontSize: '12px',
        colors: ['#6B7280'],
      },
    },
    title: {
      text: '',
      style: { fontSize: '0px' },
    },
  };

  public legend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
  };
}

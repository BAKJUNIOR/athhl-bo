
import { Component } from '@angular/core';
import { NgApexchartsModule, ApexNonAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexStroke, ApexLegend, ApexFill, ApexTooltip, ApexStates } from 'ng-apexcharts';
import { DropdownComponent } from '../../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';

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
export class MonthlySalesChartComponent {
  // Chiffres d'exemple en attendant un endpoint d'agrégation côté backend
  // (répartition des demandes reçues ce mois-ci entre devis et candidatures).
  quotesThisMonth = 24;
  applicationsThisMonth = 17;

  readonly slices: Slice[] = [
    { label: 'Demandes de devis', value: this.quotesThisMonth, color: '#f97316' },
    { label: 'Candidatures', value: this.applicationsThisMonth, color: '#5d4392' },
  ];

  readonly total = this.slices.reduce((sum, s) => sum + s.value, 0);

  public series: ApexNonAxisChartSeries = this.slices.map((s) => s.value);
  public labels: string[] = this.slices.map((s) => s.label);
  public colors: string[] = this.slices.map((s) => s.color);

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
            formatter: () => `${this.total}`,
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
    return this.total ? Math.round((value / this.total) * 100) : 0;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}

import { Component } from '@angular/core';
import { EcommerceMetricsComponent } from '../../../components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { StatisticsChartComponent } from '../../../components/ecommerce/statics-chart/statics-chart.component';
import { RecentOrdersComponent } from '../../../components/ecommerce/recent-orders/recent-orders.component';

@Component({
  selector: 'app-ecommerce',
  imports: [
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    StatisticsChartComponent,
    RecentOrdersComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent {}

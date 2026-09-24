import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastContainerComponent } from './shared/ui/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Angular Ecommerce Dashboard | ATHL-HABITAT&LOGISTIC';

  ngOnInit(): void {
    const savedDir = localStorage.getItem('dir');
    if (savedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }
}

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardTitleComponent } from '../../../../../../../shared/components/ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../../../../../shared/components/ui/card/card-description.component';

@Component({
  selector: 'app-card-five',
  imports: [
    RouterModule,
    CardTitleComponent,
    CardDescriptionComponent,
  ],
  templateUrl: './card-five.component.html',
  styles: ``
})
export class CardFiveComponent {

}

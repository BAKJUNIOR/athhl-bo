import { Component } from '@angular/core';
import { CardComponent } from '../../../../../../../shared/components/ui/card/card.component';
import { CardDescriptionComponent } from '../../../../../../../shared/components/ui/card/card-description.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-two',
  imports: [
    CardComponent,
    CardDescriptionComponent,
    RouterModule,
  ],
  templateUrl: './card-two.component.html',
  styles: ``
})
export class CardTwoComponent {

}

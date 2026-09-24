import { Component } from '@angular/core';
import { CardComponent } from '../../../../../../../shared/components/ui/card/card.component';
import { CardTitleComponent } from '../../../../../../../shared/components/ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../../../../../shared/components/ui/card/card-description.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-one',
  imports: [
    CardComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    RouterModule,
  ],
  templateUrl: './card-one.component.html',
  styles: ``
})
export class CardOneComponent {

}

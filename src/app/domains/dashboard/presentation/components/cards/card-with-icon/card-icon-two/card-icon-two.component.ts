import { Component } from '@angular/core';
import { CardTitleComponent } from '../../../../../../../shared/components/ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../../../../../shared/components/ui/card/card-description.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-icon-two',
  imports: [
    CardTitleComponent,
    CardDescriptionComponent,
    RouterModule,
],
  templateUrl: './card-icon-two.component.html',
  styles: ``
})
export class CardIconTwoComponent {

}

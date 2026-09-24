import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardTitleComponent } from '../../../../../../../shared/components/ui/card/card-title.component';
import { CardDescriptionComponent } from '../../../../../../../shared/components/ui/card/card-description.component';
import { CardComponent } from "../../../../../../../shared/components/ui/card/card.component";

@Component({
  selector: 'app-card-link-two',
  imports: [
    RouterModule,
    CardTitleComponent,
    CardDescriptionComponent,
],
  templateUrl: './card-link-two.component.html',
  styles: ``
})
export class CardLinkTwoComponent {

}

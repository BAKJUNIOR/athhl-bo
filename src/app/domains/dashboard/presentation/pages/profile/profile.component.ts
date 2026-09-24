import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../components/user-profile/user-meta-card/user-meta-card.component';
import { ChangePasswordCardComponent } from '../../components/user-profile/change-password-card/change-password-card.component';

@Component({
  selector: 'app-profile',
  imports: [
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    ChangePasswordCardComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
}

import { Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../../../../../core/services/storage.service';
import { JwtService } from '../../../../../../core/services/jwt.service';
import { AuthApi } from '../../../../../auth/infrastructure/api/auth.api';

export interface Language {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  badge?: string;
}

@Component({
  selector: 'app-user-dropdown',
  standalone: true,
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule]
})
export class UserDropdownComponent implements OnInit {
  private readonly storage = inject(StorageService);
  private readonly jwt = inject(JwtService);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApi);

  isOpen = false;
  subDropdownOpen = false;
  currentLocale = 'fr';

  displayName = 'Utilisateur';
  email = '';
  initials = '?';
  profilePictureUrl = signal<string | null>(null);

  languages: Language[] = [
    {
      id: 'fr',
      name: 'Français',
      shortName: 'Français',
      flag: 'flag-fr.svg',
    },
    {
      id: 'en',
      name: 'English',
      shortName: 'English',
      flag: 'flag-us.svg',
    },
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const savedLocale = localStorage.getItem('locale');
    this.currentLocale = savedLocale === 'en' ? 'en' : 'fr';

    const payload = this.jwt.decodePayload(this.storage.getToken());
    if (payload) {
      const firstName = payload.firstName ?? '';
      const lastName = payload.lastName ?? '';
      this.displayName = `${firstName} ${lastName}`.trim() || payload.sub;
      this.email = payload.sub;
      this.initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?';
    }

    this.authApi.currentUser().subscribe({
      next: (user) => {
        this.profilePictureUrl.set(user.profilePictureUrl ?? null);
      },
      error: () => {
        // Portrait optionnel : on garde les initiales en repli si l'appel échoue.
      },
    });
  }

  logout(): void {
    this.storage.clearAuth();
    this.closeDropdown();
    this.router.navigateByUrl('/signin');
  }

  get currentLang(): Language {
    return this.languages.find((l) => l.id === this.currentLocale) || this.languages[0];
  }

  toggleDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.subDropdownOpen = false;
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.subDropdownOpen = false;
  }

  toggleSubDropdown(event: Event): void {
    event.stopPropagation();
    this.subDropdownOpen = !this.subDropdownOpen;
  }

  selectLanguage(id: string, event?: Event): void {
    event?.stopPropagation();
    this.currentLocale = id;
    localStorage.setItem('locale', id);
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}

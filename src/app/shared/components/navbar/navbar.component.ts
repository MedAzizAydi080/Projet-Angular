import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule, AsyncPipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  authService = inject(AuthService);
  favoritesService = inject(FavoritesService);
  private subscription?: Subscription;
  searchTerm = '';
  showUserMenu = false;
  favoriteCount = signal(0);

  ngOnInit() {
    // Sync search term with URL query params using router events
    this.updateSearchFromUrl();
    this.subscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSearchFromUrl();
      });
    
    // Track favorites count
    this.favoritesService.favoriteIds$.subscribe((ids) => {
      this.favoriteCount.set(ids.length);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateSearchFromUrl() {
    const urlTree = this.router.parseUrl(this.router.url);
    this.searchTerm = urlTree.queryParams['search'] || '';
  }

  search() {
    const trimmedSearch = this.searchTerm.trim();
    if (trimmedSearch) {
      this.router.navigate(['/'], {
        queryParams: { search: trimmedSearch },
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.router.navigate(['/'], {
      queryParams: { search: null },
      replaceUrl: true,
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  signOut() {
    this.authService.signOut();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}

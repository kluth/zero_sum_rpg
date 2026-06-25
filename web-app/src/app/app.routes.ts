import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./views/landing/landing.component').then(m => m.LandingComponent) 
  },
  { 
    path: 'player', 
    loadComponent: () => import('./views/player-view/player-view.component').then(m => m.PlayerViewComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: 'gm', 
    loadComponent: () => import('./views/gm-view/gm-view.component').then(m => m.GmViewComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: 'spectator', 
    loadComponent: () => import('./views/spectator-view/spectator-view.component').then(m => m.SpectatorViewComponent), 
    canActivate: [authGuard] 
  },
];

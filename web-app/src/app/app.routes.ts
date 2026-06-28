import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./views/landing/landing.component').then(m => m.LandingComponent) 
  },
  { 
    path: 'mission-map', 
    loadComponent: () => import('./mission-map/mission-map.component').then(m => m.MissionMapComponent) 
  },
  { 
    path: 'player/:sessionId', 
    loadComponent: () => import('./views/player-view/player-view.component').then(m => m.PlayerViewComponent), 
    canActivate: [authGuard],
    data: { role: 'player' }
  },
  { 
    path: 'gm/:sessionId', 
    loadComponent: () => import('./views/gm-view/gm-view.component').then(m => m.GmViewComponent), 
    canActivate: [authGuard],
    data: { role: 'gm' }
  },
  { 
    path: 'spectator/:sessionId', 
    loadComponent: () => import('./views/spectator-view/spectator-view.component').then(m => m.SpectatorViewComponent)
    // No authGuard needed for spectator
  },
];

import { Routes } from '@angular/router';
import { PlayerViewComponent } from './views/player-view/player-view.component';
import { GmViewComponent } from './views/gm-view/gm-view.component';
import { SpectatorViewComponent } from './views/spectator-view/spectator-view.component';
import { LandingComponent } from './views/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'player', component: PlayerViewComponent },
  { path: 'gm', component: GmViewComponent },
  { path: 'spectator', component: SpectatorViewComponent },
];

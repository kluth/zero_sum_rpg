import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillboardComponent } from '../../ui/billboard/billboard.component';

@Component({
  selector: 'app-spectator-view',
  standalone: true,
  imports: [CommonModule, BillboardComponent],
  template: `
    <div style="width: 100vw; height: 100vh; overflow: hidden; background: black;">
      <app-billboard></app-billboard>
    </div>
  `
})
export class SpectatorViewComponent {}

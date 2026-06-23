import { Component } from '@angular/core';
import { BillboardComponent } from './ui/billboard/billboard.component';
import { PlayerUplinkComponent } from './ui/player-uplink/player-uplink.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BillboardComponent, PlayerUplinkComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web-app';
}

import { Component } from '@angular/core';
import { BillboardComponent } from './ui/billboard/billboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BillboardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web-app';
}

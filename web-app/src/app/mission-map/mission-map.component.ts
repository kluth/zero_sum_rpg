import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mission-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mission-map.component.html',
  styleUrls: ['./mission-map.component.scss']
})
export class MissionMapComponent implements OnInit {
  missions = [
    { id: 1, name: 'Mission 1: Operation Infiltration', x: 25, y: 40, status: 'ACTIVE' },
    { id: 2, name: 'Mission 2: Secure Data Node', x: 65, y: 20, status: 'PENDING' },
    { id: 3, name: 'Mission 3: Extraction Point', x: 80, y: 70, status: 'CLASSIFIED' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  goBack() {
    this.router.navigate(['/']);
  }
}

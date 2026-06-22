import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-clock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clock-container" [style.opacity]="isVisible ? 1 : 0.3">
      <div class="clock-title" [style.color]="color">{{ name }}</div>
      <svg viewBox="0 0 100 100" class="clock-svg" [style.filter]="'drop-shadow(0 0 5px ' + color + ')'">
        <circle cx="50" cy="50" r="48" fill="none" [attr.stroke]="color" stroke-width="2" opacity="0.3"/>
        <g [attr.transform]="'translate(50, 50)'">
           <path *ngFor="let path of paths(); let i = index" 
                 [attr.d]="path" 
                 [attr.fill]="i < filled ? color : 'transparent'"
                 [attr.stroke]="color"
                 stroke-width="1"
                 class="clock-segment" />
        </g>
      </svg>
      <div class="clock-status">{{ filled }} / {{ segments }}</div>
    </div>
  `,
  styles: [`
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 10px;
      font-family: monospace;
      width: 120px;
    }
    .clock-title {
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 5px;
      text-transform: uppercase;
      word-wrap: break-word;
      min-height: 28px;
    }
    .clock-svg {
      width: 80px;
      height: 80px;
    }
    .clock-segment {
      transition: fill 0.3s ease;
    }
    .clock-status {
      margin-top: 5px;
      color: gray;
      font-size: 10px;
    }
  `]
})
export class ProgressClockComponent {
  @Input() name: string = 'Unnamed Clock';
  @Input() segments: number = 8;
  @Input() filled: number = 0;
  @Input() color: string = '#FF2A2A';
  @Input() isVisible: boolean = true;

  paths = computed(() => {
    const p = [];
    const total = Math.max(2, this.segments); // Avoid divide by 0/1
    const angle = (Math.PI * 2) / total;
    const r = 48;
    
    for (let i = 0; i < total; i++) {
      const startAngle = i * angle - Math.PI / 2;
      const endAngle = (i + 1) * angle - Math.PI / 2;
      
      const x1 = Math.cos(startAngle) * r;
      const y1 = Math.sin(startAngle) * r;
      const x2 = Math.cos(endAngle) * r;
      const y2 = Math.sin(endAngle) * r;
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      const d = [
        'M', 0, 0,
        'L', x1, y1,
        'A', r, r, 0, largeArcFlag, 1, x2, y2,
        'Z'
      ].join(' ');
      
      p.push(d);
    }
    return p;
  });
}

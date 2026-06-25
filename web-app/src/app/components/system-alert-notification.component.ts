import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

@Component({
  selector: 'app-system-alert-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" 
         class="alert-box flex items-start gap-4 p-4 rounded-md border-l-4 shadow-lg mb-4 bg-bg-secondary"
         [ngClass]="getSeverityClass()"
         data-testid="alert-container">
      
      <div class="alert-icon text-2xl" data-testid="alert-icon">
        {{ getIcon() }}
      </div>
      
      <div class="alert-content flex-1">
        <h4 class="alert-title font-bold text-lg mb-1" [ngClass]="getTitleClass()">
          SYSTEM_ALERT: {{ severity }}
        </h4>
        <p class="alert-message text-text-primary mb-2" data-testid="alert-message">
          {{ message }}
        </p>
        <p class="alert-flavour text-sm text-text-secondary italic" data-testid="alert-flavour">
          "{{ flavourText }}"
        </p>
      </div>

      <button class="alert-close text-text-secondary hover:text-text-primary" 
              (click)="dismiss()"
              data-testid="alert-close">
        ✕
      </button>
    </div>
  `,
  styles: [`
    .bg-bg-secondary { background-color: var(--color-bg-secondary); }
    .text-text-primary { color: var(--color-text-primary); }
    .text-text-secondary { color: var(--color-text-secondary); }
    
    .border-info { border-color: var(--color-cyber-blue); }
    .border-warning { border-color: var(--color-nerve-warn); }
    .border-critical { border-color: var(--color-nerve-crit); }
    
    .text-info { color: var(--color-cyber-blue); }
    .text-warning { color: var(--color-nerve-warn); }
    .text-critical { color: var(--color-nerve-crit); }
  `]
})
export class SystemAlertNotificationComponent implements OnInit {
  @Input() message: string = '';
  @Input() severity: AlertSeverity = 'INFO';
  @Input() flavourText: string = '';
  @Input() autoDismiss: number = 0; // ms

  visible: boolean = true;

  ngOnInit() {
    if (this.autoDismiss > 0) {
      setTimeout(() => this.dismiss(), this.autoDismiss);
    }
  }

  getSeverityClass(): string {
    switch (this.severity) {
      case 'CRITICAL': return 'border-critical';
      case 'WARNING': return 'border-warning';
      default: return 'border-info';
    }
  }

  getTitleClass(): string {
    switch (this.severity) {
      case 'CRITICAL': return 'text-critical animate-pulse-red';
      case 'WARNING': return 'text-warning';
      default: return 'text-info';
    }
  }

  getIcon(): string {
    switch (this.severity) {
      case 'CRITICAL': return '💀';
      case 'WARNING': return '⚠️';
      default: return 'ℹ️';
    }
  }

  dismiss() {
    this.visible = false;
  }
}

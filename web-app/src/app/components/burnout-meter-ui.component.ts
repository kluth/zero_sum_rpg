import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-burnout-meter-ui',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="burnout-container border border-gray-600 rounded-md p-1 w-8 h-48 bg-bg-secondary flex flex-col justify-end overflow-hidden"
         [class.animate-shake]="value >= 80"
         data-testid="burnout-container">
      <div class="burnout-bar w-full transition-all duration-300 rounded-sm"
           [style.height.%]="value"
           [ngClass]="getColorClass()"
           [class.animate-pulse-red]="value >= 80"
           data-testid="burnout-bar">
      </div>
    </div>
  `,
  styles: [`
    .bg-bg-secondary {
      background-color: var(--color-bg-secondary);
    }
    .bg-nerve-ok {
      background-color: var(--color-nerve-ok);
    }
    .bg-nerve-warn {
      background-color: var(--color-nerve-warn);
    }
    .bg-nerve-crit {
      background-color: var(--color-nerve-crit);
    }
    
    @keyframes pulse-red {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse-red {
      animation: pulse-red 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }
    .animate-shake {
      animation: shake 0.5s ease-in-out infinite;
    }
  `]
})
export class BurnoutMeterUIComponent {
  private _value: number = 0;

  @Input()
  set value(val: number) {
    this._value = Math.max(0, Math.min(100, val));
  }
  
  get value(): number {
    return this._value;
  }

  getColorClass(): string {
    if (this.value >= 80) {
      return 'bg-nerve-crit';
    } else if (this.value >= 50) {
      return 'bg-nerve-warn';
    }
    return 'bg-nerve-ok';
  }
}

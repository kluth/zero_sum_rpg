import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ToastMessage {
  skill: string;
  modifier: number;
  reason: string;
}

@Component({
  selector: 'app-dynamic-bonus-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="activeToast" 
         class="toast-container fixed top-4 right-4 bg-gray-900 border-l-4 border-cyan-500 text-white p-4 shadow-lg rounded animate-slide-in">
      <div class="flex items-start">
        <div class="ml-3">
          <p class="text-sm font-bold text-cyan-400">Dynamic Bonus Granted!</p>
          <p class="text-sm mt-1">
            Skill: <span class="font-mono">{{ activeToast.skill }}</span> 
            <span class="font-bold text-green-400"> +{{ activeToast.modifier }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-1 italic">{{ activeToast.reason }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }
  `]
})
export class DynamicBonusToastComponent {
  activeToast: ToastMessage | null = null;
  private timeoutId: any;

  constructor(private cdr: ChangeDetectorRef) {}

  public showBonus(skill: string, modifier: number, reason: string): void {
    this.activeToast = { skill, modifier, reason };
    this.cdr.detectChanges();

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.activeToast = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}

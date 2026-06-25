import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ShelfSlot {
  id: string;
  item: string | null;
}

@Component({
  selector: 'app-logistics-shelf-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shelf-grid grid grid-cols-3 gap-4 p-4 bg-bg-secondary rounded-lg border-2"
         [ngClass]="getGridClass()"
         data-testid="shelf-grid">
      
      <div *ngFor="let slot of slots; let i = index" 
           class="shelf-slot h-24 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-md transition-colors"
           [class.bg-bg-primary]="!slot.item"
           [class.bg-focus-mana]="!!slot.item"
           (dragover)="onDragOver($event)"
           (drop)="onDrop($event, i)"
           data-testid="shelf-slot">
        
        <div *ngIf="slot.item" 
             class="item-cube w-16 h-16 bg-cyber-blue shadow-md rounded cursor-move flex items-center justify-center text-bg-primary font-bold"
             draggable="true"
             (dragstart)="onDragStart($event, i)"
             data-testid="shelf-item">
          {{ slot.item }}
        </div>
        
        <span *ngIf="!slot.item" class="text-text-secondary text-sm" data-testid="empty-text">Empty</span>
      </div>
      
    </div>
  `,
  styles: [`
    .bg-bg-secondary { background-color: var(--color-bg-secondary); }
    .bg-bg-primary { background-color: var(--color-bg-primary); }
    .bg-focus-mana { background-color: var(--color-focus-mana); }
    .bg-cyber-blue { background-color: var(--color-cyber-blue); }
    
    .text-text-secondary { color: var(--color-text-secondary); }
    .text-bg-primary { color: var(--color-bg-primary); }
    
    .border-warning { border-color: var(--color-nerve-warn); }
    .border-critical { border-color: var(--color-nerve-crit); }
    .border-normal { border-color: var(--color-cyber-blue); }
  `]
})
export class LogisticsShelfGridComponent {
  @Input() slots: ShelfSlot[] = [
    { id: '1', item: null },
    { id: '2', item: null },
    { id: '3', item: null }
  ];
  
  @Output() slotChanged = new EventEmitter<ShelfSlot[]>();

  get emptyCount(): number {
    return this.slots.filter(s => !s.item).length;
  }

  getGridClass(): string {
    if (this.emptyCount === this.slots.length) {
      return 'border-critical';
    } else if (this.emptyCount > this.slots.length / 2) {
      return 'border-warning';
    }
    return 'border-normal';
  }

  onDragStart(event: DragEvent, index: number) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('sourceIndex', index.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Necessary to allow dropping
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    const sourceIndexStr = event.dataTransfer?.getData('sourceIndex');
    if (sourceIndexStr !== undefined && sourceIndexStr !== '') {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (sourceIndex !== targetIndex) {
        // Swap items
        const newSlots = [...this.slots];
        const temp = newSlots[targetIndex].item;
        newSlots[targetIndex].item = newSlots[sourceIndex].item;
        newSlots[sourceIndex].item = temp;
        
        this.slots = newSlots;
        this.slotChanged.emit(this.slots);
      }
    }
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-freeform-job-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="job-profile glass-panel p-4 rounded bg-bg-primary text-text-primary border border-cyan-500">
      <h2 data-testid="hero-name" class="text-xl font-bold mb-2">{{ heroName }}</h2>
      <div class="tags-container flex flex-wrap gap-2">
        <span *ngFor="let tag of jobTags" 
              data-testid="job-tag"
              class="px-2 py-1 bg-cyan-900 text-cyan-100 rounded text-sm font-mono border border-cyan-700">
          {{ tag }}
        </span>
      </div>
    </div>
  `
})
export class FreeformJobProfileComponent {
  @Input() heroName: string = 'Unknown Hero';
  @Input() jobTags: string[] = [];
}

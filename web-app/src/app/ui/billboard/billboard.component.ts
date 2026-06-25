import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnrTracker, ThreatLevel } from '../../core/domain/snr-tracker';
import { DesignSystemConfig } from '../../core/design-system/design-tokens';

@Component({
  selector: 'app-billboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billboard.component.html',
  styleUrls: ['./billboard.component.scss']
})
export class BillboardComponent implements OnInit {
  public tracker = new SnrTracker();
  public paperWhiteColor = '#fff';
  public inkColor = '#000';
  public slateBlueColor = '#2c3e50';

  ngOnInit() {
    const paper = DesignSystemConfig.getColor('PaperWhite');
    if (paper.isSuccess) this.paperWhiteColor = paper.getValue();

    const ink = DesignSystemConfig.getColor('Ink');
    if (ink.isSuccess) this.inkColor = ink.getValue();

    const slate = DesignSystemConfig.getColor('SlateBlue');
    if (slate.isSuccess) this.slateBlueColor = slate.getValue();
  }

  public increaseSnr(amount: number) {
    const result = this.tracker.increaseSnr(amount);
    if (result.isFailure) {
      console.error(result.getError());
    }
  }

  public decreaseSnr(amount: number) {
    const result = this.tracker.decreaseSnr(amount);
    if (result.isFailure) {
      console.error(result.getError());
    }
  }

  public getThreatLevelName(): string {
    return this.tracker.getThreatLevel().toString();
  }
}

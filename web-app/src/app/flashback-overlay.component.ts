import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashback-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flashback-overlay" *ngIf="isActive">
      <div class="crt-scanline"></div>
      <div class="flashback-content">
        <h1 class="flashback-title">FLASHBACK PROTOCOL ACTIVE</h1>
        <div class="flashback-player">INITIATED BY: {{ initiatingPlayer }}</div>
        <div class="flashback-desc">"{{ description }}"</div>
        <div class="flashback-status blink">WAITING FOR GM APPROVAL...</div>
      </div>
    </div>
  `,
  styles: [`
    .flashback-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100dvh;
      box-sizing: border-box;
      overflow: hidden;
      background: rgba(255, 165, 0, 0.15); /* Amber tint */
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none; /* Let clicks pass through if GM needs to click approve */
    }
    .crt-scanline {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      background-size: 100% 2px, 3px 100%;
      z-index: 1;
      pointer-events: none;
    }
    .flashback-content {
      position: relative;
      z-index: 2;
      background: rgba(0, 0, 0, 0.85);
      border: 2px solid #FFA500;
      padding: clamp(10px, 4vmin, 40px);
      text-align: center;
      font-family: monospace;
      box-shadow: 0 0 30px rgba(255, 165, 0, 0.4);
      animation: crtFlicker 0.15s infinite alternate;
      max-width: 90vw;
      max-height: 90dvh;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    .flashback-title {
      color: #FFA500;
      font-size: clamp(16px, 4.5vmin, 36px);
      margin: 0 0 clamp(5px, 1.5vmin, 10px) 0;
      letter-spacing: clamp(1px, 0.5vmin, 5px);
      word-break: break-word;
      line-height: 1.2;
    }
    .flashback-player {
      color: white;
      font-size: clamp(12px, 2.5vmin, 18px);
      margin-bottom: clamp(10px, 2.5vmin, 20px);
      word-break: break-word;
    }
    .flashback-desc {
      color: #00E5FF;
      font-size: clamp(14px, 3.5vmin, 24px);
      font-style: italic;
      margin-bottom: clamp(15px, 3.5vmin, 30px);
      max-width: 100%;
      word-break: break-word;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
    }
    .flashback-status {
      color: #FF2A2A;
      font-weight: bold;
      font-size: clamp(14px, 3vmin, 20px);
      word-break: break-word;
    }
    .blink {
      animation: blink 1s step-end infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes crtFlicker {
      0% { opacity: 0.95; filter: contrast(110%); }
      100% { opacity: 1.0; filter: contrast(100%); }
    }
  `]
})
export class FlashbackOverlayComponent {
  @Input() isActive: boolean = false;
  @Input() initiatingPlayer: string = 'UNKNOWN';
  @Input() description: string = 'Accessing past memory banks...';
}

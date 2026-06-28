import { Component, Input, computed, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService, DashboardEvent } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-zero-sum-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zero-sum-dashboard.component.html',
  styleUrls: ['./zero-sum-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZeroSumDashboardComponent implements OnInit, OnDestroy {
  @Input() set hp(value: number) { this._hp.set(value); }
  @Input() set maxHp(value: number) { this._maxHp.set(value); }
  
  @Input() set teamMemoryUsed(value: number) { this._teamMemoryUsed.set(value); }
  @Input() set teamMemoryMax(value: number) { this._teamMemoryMax.set(value); }
  
  @Input() isMedicOrSupporter: boolean = false;
  @Input() set shadowCacheUsed(value: number) { this._shadowCacheUsed.set(value); }
  @Input() shadowCacheMax: number = 15; // MB

  private _hp = signal(100);
  private _maxHp = signal(100);
  private _teamMemoryUsed = signal(0);
  private _teamMemoryMax = signal(150);
  private _shadowCacheUsed = signal(0);

  public isGlitching = signal(false);
  private wsSubscription?: Subscription;

  constructor(private wsService: WebsocketService) {}

  ngOnInit() {
    this.wsSubscription = this.wsService.getMessages().subscribe({
      next: (event: DashboardEvent) => {
        if (event.type === 'LIMIT_DROP') {
          if (event.payload && event.payload.limit !== undefined) {
            this._teamMemoryMax.set(event.payload.limit);
          } else {
            const newLimit = Math.max(50, this._teamMemoryMax() - 25);
            this._teamMemoryMax.set(newLimit);
          }
          this.triggerGlitch();
        }
      },
      error: (err) => console.error('WS Error:', err)
    });
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
  }

  private triggerGlitch() {
    this.isGlitching.set(true);
    setTimeout(() => {
      this.isGlitching.set(false);
    }, 800);
  }

  hpPercentage = computed(() => Math.max(0, Math.min(100, (this._hp() / this._maxHp()) * 100)));
  hpStatus = computed(() => {
    const pct = this.hpPercentage();
    if (pct <= 25) return 'critical';
    if (pct <= 50) return 'warning';
    return 'ok';
  });

  teamMemoryPercentage = computed(() => Math.max(0, Math.min(100, (this._teamMemoryUsed() / this._teamMemoryMax()) * 100)));
  teamMemoryStatus = computed(() => this.teamMemoryPercentage() > 80 ? 'high-load' : 'normal');

  shadowCachePercentage = computed(() => Math.max(0, Math.min(100, (this._shadowCacheUsed() / this.shadowCacheMax) * 100)));

  // Public getters for template
  get currentHp() { return this._hp(); }
  get currentMaxHp() { return this._maxHp(); }
  get currentTeamMemory() { return this._teamMemoryUsed(); }
  get currentTeamMemoryMax() { return this._teamMemoryMax(); }
  get currentShadowCache() { return this._shadowCacheUsed(); }
}

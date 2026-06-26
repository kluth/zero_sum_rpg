import { Injectable, signal } from '@angular/core';
import { DomainEventDispatcher } from './domain-event-dispatcher.service';
import { BurnoutWarningThresholdReachedEvent } from '../../../../../core-domain/src/events/BurnoutWarningThresholdReachedEvent';
import { LogisticsBottleneckDetectedEvent } from '../../../../../core-domain/src/events/LogisticsBottleneckDetectedEvent';

export interface AlertState {
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  flavourText: string;
}

@Injectable({ providedIn: 'root' })
export class UiIntegrationService {
  public currentAlert = signal<AlertState | null>(null);

  constructor(private dispatcher: DomainEventDispatcher) {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.dispatcher.subscribe<BurnoutWarningThresholdReachedEvent>('BurnoutWarningThresholdReachedEvent')
      .subscribe(event => {
        this.currentAlert.set({
          message: `Burnout-Warnung für Charakter ${event.characterId}! (Level: ${event.currentBurnoutLevel} >= ${event.threshold})`,
          severity: 'CRITICAL',
          flavourText: 'Mehr Kaffee. Sofort.'
        });
      });

    this.dispatcher.subscribe<LogisticsBottleneckDetectedEvent>('LogisticsBottleneckDetectedEvent')
      .subscribe(event => {
        this.currentAlert.set({
          message: `Logistik-Engpass in ${event.facilityId}: ${event.missingItem} fehlt.`,
          severity: event.severity === 'LOW' ? 'INFO' : (event.severity === 'MEDIUM' ? 'WARNING' : 'CRITICAL'),
          flavourText: 'Wer hat wieder das Lager nicht aufgefüllt?'
        });
      });
  }

  public clearAlert() {
    this.currentAlert.set(null);
  }
}

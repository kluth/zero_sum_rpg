import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NetworkType = 'whispernet' | 'ocgf' | 'frequenz-x' | 'neon-lotus' | null;

export interface ActiveQuest {
  id: string;
  title: string;
  status: string;
}

export interface UiState {
  activeNetwork: NetworkType;
  activeQuest: ActiveQuest | null;
}

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private stateSubject = new BehaviorSubject<UiState>({
    activeNetwork: null,
    activeQuest: null
  });

  constructor() { }

  getState(): Observable<UiState> {
    return this.stateSubject.asObservable();
  }

  setActiveNetwork(network: NetworkType) {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, activeNetwork: network });
  }

  setActiveQuest(quest: ActiveQuest | null) {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, activeQuest: quest });
  }
}

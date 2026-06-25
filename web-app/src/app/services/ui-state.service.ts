import { Injectable, signal } from '@angular/core';
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

  // Signals
  public isStabilized = signal<boolean>(false);
  public currentTheme = signal<'corporate' | 'terminal'>('corporate');

  constructor() {
    this.bootState();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'remote_theme_override' || event.key === 'zero_sum_theme') {
          const val = event.newValue;
          if (val === 'theme-terminal' || val === 'terminal') {
            this.setTheme('terminal');
          } else if (val === 'theme-corporate' || val === 'corporate') {
            this.setTheme('corporate');
          }
        }
        if (event.key === 'zero_sum_stabilized') {
          if (event.newValue === 'true') {
            this.setStabilized(true);
          } else if (event.newValue === 'false') {
            this.setStabilized(false);
          }
        }
      });
    }
  }

  private bootState() {
    let bootTheme: 'corporate' | 'terminal' = 'corporate';
    let bootStabilized = false;

    try {
      if (typeof localStorage !== 'undefined') {
        const localTheme = localStorage.getItem('zero_sum_theme');
        const remoteTheme = localStorage.getItem('remote_theme_override');
        const localStab = localStorage.getItem('zero_sum_stabilized');

        const getThemeValue = (val: string | null): 'corporate' | 'terminal' | null => {
          if (!val) return null;
          if (val === 'theme-terminal' || val === 'terminal') return 'terminal';
          if (val === 'theme-corporate' || val === 'corporate') return 'corporate';
          return null;
        };

        const parsedRemote = getThemeValue(remoteTheme);
        const parsedLocal = getThemeValue(localTheme);

        if (parsedRemote) {
          bootTheme = parsedRemote;
        } else if (parsedLocal) {
          bootTheme = parsedLocal;
        }

        if (localStab === 'true') {
          bootStabilized = true;
        } else if (localStab === 'false') {
          bootStabilized = false;
        }
      }
    } catch (e) {
      console.error('Error booting UI state from localStorage:', e);
    }

    this.currentTheme.set(bootTheme);
    this.isStabilized.set(bootStabilized);
    this.applyClasses();
  }

  public applyClasses() {
    if (typeof document === 'undefined') return;

    const theme = this.currentTheme();
    const isStab = this.isStabilized();

    if (theme === 'terminal') {
      document.body.classList.add('theme-terminal');
      document.body.classList.remove('theme-corporate');
    } else {
      document.body.classList.add('theme-corporate');
      document.body.classList.remove('theme-terminal');
    }

    if (isStab) {
      document.body.classList.add('motion-stabilized');
      document.body.classList.add('stabilized');
    } else {
      document.body.classList.remove('motion-stabilized');
      document.body.classList.remove('stabilized');
    }

    const desktop = document.querySelector('.os-desktop');
    if (desktop) {
      if (isStab) {
        desktop.classList.add('stabilized');
        desktop.classList.add('motion-stabilized');
      } else {
        desktop.classList.remove('stabilized');
        desktop.classList.remove('motion-stabilized');
      }
    }
  }

  setTheme(theme: 'corporate' | 'terminal') {
    this.currentTheme.set(theme);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('zero_sum_theme', theme);
      }
    } catch (e) {
      console.error('Error setting zero_sum_theme in localStorage:', e);
    }
    this.applyClasses();
  }

  toggleTheme() {
    const nextTheme = this.currentTheme() === 'corporate' ? 'terminal' : 'corporate';
    this.setTheme(nextTheme);
  }

  setStabilized(stabilized: boolean) {
    this.isStabilized.set(stabilized);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('zero_sum_stabilized', stabilized ? 'true' : 'false');
      }
    } catch (e) {
      console.error('Error setting zero_sum_stabilized in localStorage:', e);
    }
    this.applyClasses();
  }

  toggleStabilizer() {
    this.setStabilized(!this.isStabilized());
  }

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

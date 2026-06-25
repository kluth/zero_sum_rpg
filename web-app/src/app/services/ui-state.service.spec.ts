import { TestBed } from '@angular/core/testing';
import { UiStateService } from './ui-state.service';

describe('UiStateService', () => {
  let service: UiStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially have null network and quest', (done) => {
    service.getState().subscribe(state => {
      expect(state.activeNetwork).toBeNull();
      expect(state.activeQuest).toBeNull();
      done();
    });
  });

  it('should update active network', (done) => {
    service.setActiveNetwork('whispernet');
    service.getState().subscribe(state => {
      expect(state.activeNetwork).toEqual('whispernet');
      done();
    });
  });

  it('should update active quest', (done) => {
    const quest = { id: 'q1', title: 'Test Quest', status: 'active' };
    service.setActiveQuest(quest);
    service.getState().subscribe(state => {
      expect(state.activeQuest).toEqual(quest);
      done();
    });
  });
});

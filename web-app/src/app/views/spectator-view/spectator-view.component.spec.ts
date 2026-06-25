import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectatorViewComponent } from './spectator-view.component';

describe('SpectatorViewComponent', () => {
  let component: SpectatorViewComponent;
  let fixture: ComponentFixture<SpectatorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpectatorViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpectatorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

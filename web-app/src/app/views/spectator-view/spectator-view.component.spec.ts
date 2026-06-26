import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SpectatorViewComponent } from './spectator-view.component';

describe('SpectatorViewComponent', () => {
  let component: SpectatorViewComponent;
  let fixture: ComponentFixture<SpectatorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpectatorViewComponent],
      providers: [provideRouter([])]
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

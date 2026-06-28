import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionMapComponent } from './mission-map.component';

describe('MissionMapComponent', () => {
  let component: MissionMapComponent;
  let fixture: ComponentFixture<MissionMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

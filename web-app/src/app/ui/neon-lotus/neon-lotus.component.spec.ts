import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeonLotusComponent } from './neon-lotus.component';

describe('NeonLotusComponent', () => {
  let component: NeonLotusComponent;
  let fixture: ComponentFixture<NeonLotusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeonLotusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NeonLotusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequenzXComponent } from './frequenz-x.component';

describe('FrequenzXComponent', () => {
  let component: FrequenzXComponent;
  let fixture: ComponentFixture<FrequenzXComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequenzXComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrequenzXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcgfComponent } from './ocgf.component';

describe('OcgfComponent', () => {
  let component: OcgfComponent;
  let fixture: ComponentFixture<OcgfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcgfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OcgfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

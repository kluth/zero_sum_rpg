import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GmViewComponent } from './gm-view.component';

describe('GmViewComponent', () => {
  let component: GmViewComponent;
  let fixture: ComponentFixture<GmViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GmViewComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GmViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

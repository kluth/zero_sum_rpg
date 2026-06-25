import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BurnoutMeterUIComponent } from './burnout-meter-ui.component';
import { By } from '@angular/platform-browser';

describe('BurnoutMeterUIComponent', () => {
  let component: BurnoutMeterUIComponent;
  let fixture: ComponentFixture<BurnoutMeterUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BurnoutMeterUIComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BurnoutMeterUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clamp value between 0 and 100', () => {
    component.value = -10;
    expect(component.value).toBe(0);

    component.value = 150;
    expect(component.value).toBe(100);
  });

  it('should apply ok color class for values < 50', () => {
    component.value = 30;
    fixture.detectChanges();
    
    const bar = fixture.debugElement.query(By.css('[data-testid="burnout-bar"]'));
    expect(bar.classes['bg-nerve-ok']).toBeTrue();
  });

  it('should apply warn color class for values >= 50 and < 80', () => {
    component.value = 60;
    fixture.detectChanges();
    
    const bar = fixture.debugElement.query(By.css('[data-testid="burnout-bar"]'));
    expect(bar.classes['bg-nerve-warn']).toBeTrue();
  });

  it('should apply crit color and animations for values >= 80', () => {
    component.value = 85;
    fixture.detectChanges();
    
    const bar = fixture.debugElement.query(By.css('[data-testid="burnout-bar"]'));
    const container = fixture.debugElement.query(By.css('[data-testid="burnout-container"]'));
    
    expect(bar.classes['bg-nerve-crit']).toBeTrue();
    expect(bar.classes['animate-pulse-red']).toBeTrue();
    expect(container.classes['animate-shake']).toBeTrue();
  });
});

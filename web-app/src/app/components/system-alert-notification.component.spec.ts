import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SystemAlertNotificationComponent } from './system-alert-notification.component';
import { By } from '@angular/platform-browser';

describe('SystemAlertNotificationComponent', () => {
  let component: SystemAlertNotificationComponent;
  let fixture: ComponentFixture<SystemAlertNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAlertNotificationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemAlertNotificationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render message and flavour text', () => {
    component.message = 'Personalmangel detektiert.';
    component.flavourText = 'Wir klatschen trotzdem für euch.';
    fixture.detectChanges();

    const msgEl = fixture.debugElement.query(By.css('[data-testid="alert-message"]')).nativeElement;
    const flavourEl = fixture.debugElement.query(By.css('[data-testid="alert-flavour"]')).nativeElement;

    expect(msgEl.textContent.trim()).toBe('Personalmangel detektiert.');
    expect(flavourEl.textContent.trim()).toBe('"Wir klatschen trotzdem für euch."');
  });

  it('should apply critical styling for CRITICAL severity', () => {
    component.severity = 'CRITICAL';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('[data-testid="alert-container"]'));
    expect(container.classes['border-critical']).toBeTrue();
  });

  it('should dismiss when close button is clicked', () => {
    fixture.detectChanges();
    expect(component.visible).toBeTrue();

    const closeBtn = fixture.debugElement.query(By.css('[data-testid="alert-close"]'));
    closeBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.visible).toBeFalse();
    const container = fixture.debugElement.query(By.css('[data-testid="alert-container"]'));
    expect(container).toBeNull();
  });

  it('should auto-dismiss if autoDismiss > 0', fakeAsync(() => {
    component.autoDismiss = 1000;
    fixture.detectChanges(); // triggers ngOnInit
    
    expect(component.visible).toBeTrue();
    
    tick(1000);
    fixture.detectChanges();
    
    expect(component.visible).toBeFalse();
  }));
});

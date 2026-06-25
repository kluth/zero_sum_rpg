import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DynamicBonusToastComponent } from './dynamic-bonus-toast.component';
import { By } from '@angular/platform-browser';

describe('DynamicBonusToastComponent', () => {
  let component: DynamicBonusToastComponent;
  let fixture: ComponentFixture<DynamicBonusToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicBonusToastComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicBonusToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not render anything when there is no toast', () => {
    const toastEl = fixture.debugElement.query(By.css('.toast-container'));
    expect(toastEl).toBeNull();
  });

  it('should display a toast when showBonus is called', fakeAsync(() => {
    component.showBonus('Wundversorgung', 2, 'GM Award');
    fixture.detectChanges();

    let toastEl = fixture.debugElement.query(By.css('.toast-container')).nativeElement;
    expect(toastEl.textContent).toContain('Wundversorgung');
    expect(toastEl.textContent).toContain('+2');
    expect(toastEl.textContent).toContain('GM Award');

    // Toast should disappear after 3 seconds
    tick(3000);
    fixture.detectChanges();
    toastEl = fixture.debugElement.query(By.css('.toast-container'));
    expect(toastEl).toBeNull();
  }));
});

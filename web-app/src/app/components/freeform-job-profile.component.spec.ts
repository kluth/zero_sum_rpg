import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FreeformJobProfileComponent } from './freeform-job-profile.component';
import { By } from '@angular/platform-browser';

describe('FreeformJobProfileComponent', () => {
  let component: FreeformJobProfileComponent;
  let fixture: ComponentFixture<FreeformJobProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeformJobProfileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FreeformJobProfileComponent);
    component = fixture.componentInstance;
  });

  it('should display the hero name and job tags', () => {
    component.heroName = 'Medic John';
    component.jobTags = ['Pflegekraft', 'Nachtschicht'];
    fixture.detectChanges();

    const nameEl = fixture.debugElement.query(By.css('[data-testid="hero-name"]')).nativeElement;
    expect(nameEl.textContent).toContain('Medic John');

    const tagsEls = fixture.debugElement.queryAll(By.css('[data-testid="job-tag"]'));
    expect(tagsEls.length).toBe(2);
    expect(tagsEls[0].nativeElement.textContent).toContain('Pflegekraft');
    expect(tagsEls[1].nativeElement.textContent).toContain('Nachtschicht');
  });
});

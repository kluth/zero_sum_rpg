import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogisticsShelfGridComponent } from './logistics-shelf-grid.component';
import { By } from '@angular/platform-browser';

describe('LogisticsShelfGridComponent', () => {
  let component: LogisticsShelfGridComponent;
  let fixture: ComponentFixture<LogisticsShelfGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogisticsShelfGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LogisticsShelfGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should apply critical border if all slots are empty', () => {
    component.slots = [
      { id: '1', item: null },
      { id: '2', item: null }
    ];
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('[data-testid="shelf-grid"]'));
    expect(grid.classes['border-critical']).toBeTrue();
  });

  it('should apply warning border if >50% slots are empty', () => {
    component.slots = [
      { id: '1', item: 'Medkit' },
      { id: '2', item: null },
      { id: '3', item: null }
    ];
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('[data-testid="shelf-grid"]'));
    expect(grid.classes['border-warning']).toBeTrue();
  });

  it('should render items correctly', () => {
    component.slots = [
      { id: '1', item: 'Ammo' },
      { id: '2', item: null }
    ];
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('[data-testid="shelf-item"]'));
    expect(items.length).toBe(1);
    expect(items[0].nativeElement.textContent.trim()).toBe('Ammo');
  });

  it('should swap items on drop', () => {
    component.slots = [
      { id: '1', item: 'Medkit' },
      { id: '2', item: null }
    ];
    fixture.detectChanges();
    
    spyOn(component.slotChanged, 'emit');

    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      dataTransfer: {
        getData: jasmine.createSpy('getData').and.returnValue('0')
      }
    } as unknown as DragEvent;

    component.onDrop(mockEvent, 1);

    expect(component.slots[0].item).toBeNull();
    expect(component.slots[1].item).toBe('Medkit');
    expect(component.slotChanged.emit).toHaveBeenCalledWith(component.slots);
  });
});

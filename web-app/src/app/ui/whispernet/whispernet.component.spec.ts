import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhispernetComponent } from './whispernet.component';

describe('WhispernetComponent', () => {
  let component: WhispernetComponent;
  let fixture: ComponentFixture<WhispernetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhispernetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhispernetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { FacilityGeneratorService } from './facility-generator.service';
import { GridStore } from '../../grid.store';

describe('FacilityGeneratorService', () => {
  let service: FacilityGeneratorService;
  let mockGridStore: any;

  beforeEach(() => {
    mockGridStore = {
      setState: jasmine.createSpy('setState'),
      updateRoom: jasmine.createSpy('updateRoom'),
      updateCell: jasmine.createSpy('updateCell'),
      grid: jasmine.createSpy('grid').and.returnValue({}),
      rooms: jasmine.createSpy('rooms').and.returnValue({})
    };

    TestBed.configureTestingModule({
      providers: [
        FacilityGeneratorService,
        { provide: GridStore, useValue: mockGridStore }
      ]
    });
    service = TestBed.inject(FacilityGeneratorService);
  });

  it('should generate a procedural facility and connect all rooms', () => {
    const result = service.generateProceduralFacility(1);
    expect(mockGridStore.setState).toHaveBeenCalled();
    expect(mockGridStore.updateRoom).toHaveBeenCalled();
    expect(mockGridStore.updateCell).toHaveBeenCalled();
    expect(result).toBe("FACILITY GENERATED SUCCESSFULLY. ALL ROOMS CONNECTED.");
  });

  it('should apply an office template to a room', () => {
    const mockRoom = { bounds: { x: 0, y: 0, w: 10, h: 10 } };
    mockGridStore.rooms.and.returnValue({ 'room1': mockRoom });
    service.applyRoomTemplate('room1', 'office', 1);
    expect(mockGridStore.updateRoom).toHaveBeenCalledWith('room1', jasmine.objectContaining({ tag: 'Corporate Office' }));
  });
});

import { TestBed } from '@angular/core/testing';
import { FeedService, FeedMessage } from './feed.service';

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should stream feed messages', (done) => {
    const testMsg: FeedMessage = {
      id: '1',
      network: 'whispernet',
      content: 'test content',
      timestamp: new Date()
    };

    service.streamMessages().subscribe(msg => {
      expect(msg).toEqual(testMsg);
      done();
    });

    service.pushMessage(testMsg);
  });
});

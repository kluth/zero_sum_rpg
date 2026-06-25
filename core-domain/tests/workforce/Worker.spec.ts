import { Worker } from '../../src/workforce/Worker';
import { Tag } from '../../src/workforce/Tag';
import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';

describe('Worker and Tag-System', () => {
  const createWorker = (tags: Tag[] = []) => {
    const nr = Nervenkostuem.create(100);
    const br = BurnoutMeter.create(0);
    const kr = KoffeinPegel.create(100);
    if (nr.isSuccess() && br.isSuccess() && kr.isSuccess()) {
      return Worker.create('worker-1', 'Test Worker', nr.value, br.value, kr.value, tags);
    }
    throw new Error('Could not create attributes');
  };

  it('should be able to perform Triage if it has the Triage tag', () => {
    const worker = createWorker([Tag.TRIAGE]);
    const result = worker.performAction(Tag.TRIAGE, { target: 'patient-1' });
    
    expect(result.isSuccess()).toBe(true);
    expect(worker.getBurnoutMeter().getValue()).toBe(10); // 10 Stress
    expect(worker.getKoffeinPegel().getValue()).toBe(80); // 20 Koffein cost
  });

  it('should fail to perform Triage if it lacks the Triage tag', () => {
    const worker = createWorker([]);
    const result = worker.performAction(Tag.TRIAGE, { target: 'patient-1' });
    
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toContain('Missing tag');
    }
  });

  it('should be able to perform Deeskalation if it has the Deeskalation tag', () => {
    const worker = createWorker([Tag.DEESKALATION]);
    const result = worker.performAction(Tag.DEESKALATION, {});
    
    expect(result.isSuccess()).toBe(true);
    expect(worker.getBurnoutMeter().getValue()).toBe(15); // 15 Stress
    expect(worker.getKoffeinPegel().getValue()).toBe(70); // 30 Koffein cost
  });

  it('should support multiple tags', () => {
    const worker = createWorker([Tag.TRIAGE, Tag.DEESKALATION]);
    expect(worker.hasTag(Tag.TRIAGE)).toBe(true);
    expect(worker.hasTag(Tag.DEESKALATION)).toBe(true);
  });
});

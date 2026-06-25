import { Schichtleiter } from '../../src/workforce/Schichtleiter';
import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';
import { SchichtTasche, Item } from '../../src/workforce/SchichtTasche';

describe('Schichtleiter', () => {
  const createSchichtleiter = (focus: number = 100, tascheCapacity: number = 2) => {
    const nr = Nervenkostuem.create(100);
    const br = BurnoutMeter.create(0);
    const kr = KoffeinPegel.create(focus);
    const tr = SchichtTasche.create(tascheCapacity);
    
    if (nr.isSuccess() && br.isSuccess() && kr.isSuccess() && tr.isSuccess()) {
      return Schichtleiter.create('leader-1', 'Sgt. Hartman', nr.value, br.value, kr.value, tr.value);
    }
    throw new Error('Failed to create dependencies');
  };

  const item1: Item = { id: '1', name: 'Medkit' };
  const item2: Item = { id: '2', name: 'Ammo' };
  const item3: Item = { id: '3', name: 'Ration' };

  it('should collect and use items', () => {
    const leader = createSchichtleiter();
    
    expect(leader.collectItem(item1).isSuccess()).toBe(true);
    expect(leader.getTasche().getItems().length).toBe(1);
    
    expect(leader.collectItem(item2).isSuccess()).toBe(true);
    expect(leader.collectItem(item3).isFailure()).toBe(true); // Capacity is 2
    
    expect(leader.useItem('1').isSuccess()).toBe(true);
    expect(leader.getTasche().getItems().length).toBe(1);
    expect(leader.useItem('99').isFailure()).toBe(true);
  });

  it('should execute deeskalieren successfully', () => {
    const leader = createSchichtleiter();
    const result = leader.deeskalieren();
    
    expect(result.isSuccess()).toBe(true);
    expect(leader.getKoffeinPegel().getValue()).toBe(70); // 100 - 30
    expect(leader.getBurnoutMeter().getValue()).toBe(15); // 0 + 15
  });

  it('should fail deeskalieren if not enough focus', () => {
    const leader = createSchichtleiter(20); // Only 20 focus
    const result = leader.deeskalieren();
    
    expect(result.isFailure()).toBe(true);
  });

  it('should handle logisticsCheck based on inventory status', () => {
    const leader = createSchichtleiter();
    
    leader.logisticsCheck(); // Empty -> +5 stress
    expect(leader.getBurnoutMeter().getValue()).toBe(5);
    
    leader.collectItem(item1);
    leader.collectItem(item2); // Now full
    
    leader.logisticsCheck(); // Full -> -10 stress, clamped to 0
    expect(leader.getBurnoutMeter().getValue()).toBe(0);
  });
});

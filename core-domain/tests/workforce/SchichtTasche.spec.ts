import { SchichtTasche, Item } from '../../src/workforce/SchichtTasche';

describe('SchichtTasche', () => {
  const item1: Item = { id: '1', name: 'Medkit' };
  const item2: Item = { id: '2', name: 'Sticker' };
  const item3: Item = { id: '3', name: 'Defib' };
  const item4: Item = { id: '4', name: 'Coffee' };

  it('should create a valid SchichtTasche with specific capacity', () => {
    const result = SchichtTasche.create(3);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.getCapacity()).toBe(3);
      expect(result.value.getItems().length).toBe(0);
    }
  });

  it('should fail to create if capacity is less than 0', () => {
    const result = SchichtTasche.create(-1);
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBe('Capacity must be at least 0.');
    }
  });

  it('should add an item successfully', () => {
    const result = SchichtTasche.create(3);
    if (result.isSuccess()) {
      const added = result.value.addItem(item1);
      expect(added.isSuccess()).toBe(true);
      if (added.isSuccess()) {
        expect(added.value.getItems()).toContain(item1);
      }
    }
  });

  it('should fail to add an item if tasche is full', () => {
    let result = SchichtTasche.create(2);
    if (result.isSuccess()) {
      let tasche = result.value;
      const add1 = tasche.addItem(item1);
      if (add1.isSuccess()) tasche = add1.value;
      const add2 = tasche.addItem(item2);
      if (add2.isSuccess()) tasche = add2.value;
      
      const failed = tasche.addItem(item3);
      expect(failed.isFailure()).toBe(true);
      if (failed.isFailure()) {
        expect(failed.error).toBe('SchichtTasche is full.');
      }
    }
  });

  it('should remove an item successfully', () => {
    let result = SchichtTasche.create(3);
    if (result.isSuccess()) {
      let tasche = result.value;
      const add1 = tasche.addItem(item1);
      if (add1.isSuccess()) tasche = add1.value;
      const add2 = tasche.addItem(item2);
      if (add2.isSuccess()) tasche = add2.value;
      
      const removed = tasche.removeItem('1');
      expect(removed.isSuccess()).toBe(true);
      if (removed.isSuccess()) {
        expect(removed.value.getItems().length).toBe(1);
        expect(removed.value.getItems()).not.toContain(item1);
      }
    }
  });

  it('should fail to remove an item if it does not exist', () => {
    let result = SchichtTasche.create(3);
    if (result.isSuccess()) {
      let tasche = result.value;
      const add1 = tasche.addItem(item1);
      if (add1.isSuccess()) tasche = add1.value;
      
      const removed = tasche.removeItem('99');
      expect(removed.isFailure()).toBe(true);
      if (removed.isFailure()) {
        expect(removed.error).toBe('Item not found in SchichtTasche.');
      }
    }
  });
});

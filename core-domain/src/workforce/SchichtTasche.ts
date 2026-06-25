import { Result, success, failure } from '../shared/Result';

export interface Item {
  id: string;
  name: string;
}

export class SchichtTasche {
  private constructor(
    private readonly capacity: number,
    private readonly items: Item[]
  ) {}

  public static create(capacity: number, items: Item[] = []): Result<SchichtTasche, string> {
    if (capacity < 0) {
      return failure('Capacity must be at least 0.');
    }
    if (items.length > capacity) {
      return failure('Initial items exceed capacity.');
    }
    return success(new SchichtTasche(capacity, items));
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getItems(): Item[] {
    return [...this.items];
  }

  public isFull(): boolean {
    return this.items.length >= this.capacity;
  }

  public addItem(item: Item): Result<SchichtTasche, string> {
    if (this.isFull()) {
      return failure('SchichtTasche is full.');
    }
    return success(new SchichtTasche(this.capacity, [...this.items, item]));
  }

  public removeItem(itemId: string): Result<SchichtTasche, string> {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index === -1) {
      return failure('Item not found in SchichtTasche.');
    }
    const newItems = [...this.items];
    newItems.splice(index, 1);
    return success(new SchichtTasche(this.capacity, newItems));
  }
}

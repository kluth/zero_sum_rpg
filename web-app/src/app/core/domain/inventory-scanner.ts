import { Result } from '../design-system/result';

export interface Item {
  id: string;
  name: string;
}

export class InventoryScanner {
  private items: Item[] = [];

  public scanItem(code: string): Result<Item> {
    if (!code || code.trim() === '') return Result.failure('Invalid code');
    
    // Mock resolving an NFC/QR tag
    const itemName = this.resolveCodeToName(code);
    const item: Item = { id: code, name: itemName };
    this.items.push(item);
    
    return Result.success(item);
  }

  public getItems(): Item[] {
    return this.items;
  }

  private resolveCodeToName(code: string): string {
    if (code === 'WPN-01') return 'Suppressed Pistol';
    if (code === 'TOOL-99') return 'Lockpick Set';
    return `Unknown Asset [${code}]`;
  }
}

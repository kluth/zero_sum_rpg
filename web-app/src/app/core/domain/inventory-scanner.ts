import { Result } from '../design-system/result';

export interface Item {
  id: string;
  name: string;
}

export class InventoryScanner {
  private items: Item[] = [];

  public scanItem(code: string): Result<Item> {
    if (!code || code.trim() === '') return Result.failure('Invalid code');
    
    // Remote/Backend resolution required instead of hardcoded strings
    const itemName = this.resolveCodeToName(code);
    const item: Item = { id: code, name: itemName };
    this.items.push(item);
    
    return Result.success(item);
  }

  public async scanPhysicalTag(): Promise<Result<Item>> {
    try {
      if (typeof window === 'undefined' || !('NDEFReader' in window)) {
        return Result.failure('Hardware scanning not available in this context.');
      }
      
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      return new Promise((resolve) => {
        ndef.addEventListener("reading", ({ message }: any) => {
          const record = message.records[0];
          if (!record) return resolve(Result.failure('Empty NFC Tag'));
          
          const decoder = new TextDecoder();
          const code = decoder.decode(record.data);
          resolve(this.scanItem(code));
        }, { once: true });
        
        ndef.addEventListener("readingerror", () => {
          resolve(Result.failure('NFC read error. Try again.'));
        }, { once: true });
      });
    } catch (e: any) {
      return Result.failure(`Scanner failed: ${e.message}`);
    }
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

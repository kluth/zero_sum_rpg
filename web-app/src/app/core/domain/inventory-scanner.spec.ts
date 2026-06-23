import { InventoryScanner } from './inventory-scanner';

describe('Inventory Scanner Domain', () => {
  let scanner: InventoryScanner;

  beforeEach(() => {
    scanner = new InventoryScanner();
  });

  it('should scan a valid code and add to inventory', () => {
    const result = scanner.scanItem('WPN-01');
    expect(result.isSuccess).toBeTrue();
    expect(result.getValue().name).toBe('Suppressed Pistol');
    expect(scanner.getItems().length).toBe(1);
  });

  it('should fail when scanning an empty code', () => {
    const result = scanner.scanItem('');
    expect(result.isFailure).toBeTrue();
    expect(scanner.getItems().length).toBe(0);
  });
});

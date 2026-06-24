import { Shadowcaster, OpticalTopology } from '../../src/optics/Shadowcaster';
import { Coordinate } from '../../src/optics/Coordinate';
import { OpticalImpedance } from '../../src/optics/OpticalImpedance';

class MockTopology implements OpticalTopology {
  private map: Set<string> = new Set(); // Stores opaque coordinates as 'x,y'

  setOpaque(x: number, y: number) {
    this.map.add(`${x},${y}`);
  }

  getImpedance(coord: Coordinate): OpticalImpedance {
    const isOpaque = this.map.has(`${coord.x},${coord.y}`);
    return OpticalImpedance.create(isOpaque ? 1.0 : 0.0)._unsafeUnwrap();
  }
}

describe('Shadowcaster', () => {
  it('should calculate FOV in an open area', () => {
    const topology = new MockTopology();
    const shadowcaster = new Shadowcaster(topology);
    const origin = Coordinate.create(0, 0)._unsafeUnwrap();
    
    const fov = shadowcaster.computeFov(origin, 2);
    // Radius 2 should include (0,0), (+-1,0), (0,+-1), (+-1,+-1), (+-2,0), etc.
    expect(fov.length).toBeGreaterThan(0);
    
    // Origin is always visible
    expect(fov.some(c => c.x === 0 && c.y === 0)).toBe(true);
    // (2,0) is visible
    expect(fov.some(c => c.x === 2 && c.y === 0)).toBe(true);
  });

  it('should block visibility behind an opaque wall', () => {
    const topology = new MockTopology();
    topology.setOpaque(1, 0); // Wall immediately east
    
    const shadowcaster = new Shadowcaster(topology);
    const origin = Coordinate.create(0, 0)._unsafeUnwrap();
    
    const fov = shadowcaster.computeFov(origin, 3);
    
    // (1,0) should be visible (we see the wall itself)
    expect(fov.some(c => c.x === 1 && c.y === 0)).toBe(true);
    // (2,0) should NOT be visible (blocked by the wall)
    expect(fov.some(c => c.x === 2 && c.y === 0)).toBe(false);
  });
});

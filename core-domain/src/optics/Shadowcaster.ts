import { Coordinate } from './Coordinate';
import { OpticalImpedance } from './OpticalImpedance';
import { OctantTransform } from './OctantTransform';

export interface OpticalTopology {
  getImpedance(coord: Coordinate): OpticalImpedance;
}

export class Shadowcaster {
  constructor(private readonly topology: OpticalTopology) {}

  public computeFov(origin: Coordinate, range: number): Coordinate[] {
    const visible: Coordinate[] = [origin];
    const visibleSet = new Set<string>([`${origin.x},${origin.y}`]);

    for (let octant = 0; octant < 8; octant++) {
      this.scanOctant(
        new OctantTransform(octant),
        origin,
        range,
        1,
        1.0,
        0.0,
        visible,
        visibleSet
      );
    }
    return visible;
  }

  private scanOctant(
    transform: OctantTransform,
    origin: Coordinate,
    range: number,
    row: number,
    startSlope: number,
    endSlope: number,
    visible: Coordinate[],
    visibleSet: Set<string>
  ): void {
    if (startSlope < endSlope) return;

    let nextStartSlope = startSlope;
    let previousWasOpaque = false;

    for (let col = Math.round(row * endSlope); col <= row; col++) {
      const coord = transform.transform(origin, row, col);
      
      // Check range limit
      if (origin.distanceTo(coord) > range) continue;

      // Add to visible if not already there
      const key = `${coord.x},${coord.y}`;
      if (!visibleSet.has(key)) {
        visibleSet.add(key);
        visible.push(coord);
      }

      const impedance = this.topology.getImpedance(coord);
      const isOpaque = impedance.value === 1.0;

      if (previousWasOpaque) {
        if (isOpaque) {
          nextStartSlope = this.getRightSlope(row, col);
        } else {
          previousWasOpaque = false;
          startSlope = nextStartSlope;
        }
      } else {
        if (isOpaque) {
          if (row < range) {
            this.scanOctant(transform, origin, range, row + 1, startSlope, this.getRightSlope(row, col), visible, visibleSet);
          }
          previousWasOpaque = true;
          nextStartSlope = this.getLeftSlope(row, col);
        }
      }
    }

    if (!previousWasOpaque && row < range) {
      this.scanOctant(transform, origin, range, row + 1, startSlope, endSlope, visible, visibleSet);
    }
  }

  private getLeftSlope(row: number, col: number): number {
    return (col - 0.5) / (row + 0.5);
  }

  private getRightSlope(row: number, col: number): number {
    return (col + 0.5) / (row - 0.5);
  }
}

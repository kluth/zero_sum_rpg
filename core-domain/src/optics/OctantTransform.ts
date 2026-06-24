import { Coordinate } from './Coordinate';

// The 8 octants, representing the transformations for (row, col) to (x, y)
const OCTANT_MATRIX = [
  { xx:  1, xy:  0, yx:  0, yy: -1 }, // 0: NNE
  { xx:  0, xy:  1, yx: -1, yy:  0 }, // 1: ENE
  { xx:  0, xy:  1, yx:  1, yy:  0 }, // 2: ESE
  { xx:  1, xy:  0, yx:  0, yy:  1 }, // 3: SSE
  { xx: -1, xy:  0, yx:  0, yy:  1 }, // 4: SSW
  { xx:  0, xy: -1, yx:  1, yy:  0 }, // 5: WSW
  { xx:  0, xy: -1, yx: -1, yy:  0 }, // 6: WNW
  { xx: -1, xy:  0, yx:  0, yy: -1 }, // 7: NNW
];

export class OctantTransform {
  private matrix: { xx: number; xy: number; yx: number; yy: number };

  constructor(public readonly octant: number) {
    if (octant < 0 || octant > 7) {
      // Internal error, not a domain error from user input, hence throw is acceptable
      // for developer misuse, but we should use Result if it's from an external port.
      // Since this is purely internal logic for shadowcasting, a hard throw is fine.
      throw new Error(`Invalid octant: ${octant}`);
    }
    this.matrix = OCTANT_MATRIX[octant];
  }

  public transform(origin: Coordinate, row: number, col: number): Coordinate {
    const x = origin.x + col * this.matrix.xx + row * this.matrix.xy;
    const y = origin.y + col * this.matrix.yx + row * this.matrix.yy;
    return Coordinate.create(x, y)._unsafeUnwrap();
  }
}

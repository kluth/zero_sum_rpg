import { Coordinate } from '../optics/Coordinate';
import { AcousticImpedance } from './AcousticImpedance';
import { Decibel } from './Decibel';

export interface AcousticTopology {
  getImpedance(coord: Coordinate): AcousticImpedance;
}

interface Node {
  coord: Coordinate;
  currentDb: number;
}

export class SoundPropagation {
  constructor(private readonly topology: AcousticTopology) {}

  public computeHearingRange(origin: Coordinate, sourceDb: Decibel, threshold: Decibel): Coordinate[] {
    const audible: Coordinate[] = [];
    const visited = new Map<string, number>(); // Stores max dB found at coord
    
    // Using a simple BFS queue. A Priority Queue would be optimal for true Dijkstra.
    const queue: Node[] = [{ coord: origin, currentDb: sourceDb.db }];
    visited.set(`${origin.x},${origin.y},${origin.z}`, sourceDb.db);

    while (queue.length > 0) {
      // Dequeue the node with max dB to ensure optimal path
      queue.sort((a, b) => b.currentDb - a.currentDb);
      const current = queue.shift()!;

      audible.push(current.coord);

      const neighbors = this.getNeighbors(current.coord);
      for (const neighbor of neighbors) {
        const impedance = this.topology.getImpedance(neighbor);
        // Basic inverse square logic + impedance
        // In grid terms, distance 1 -> subtract impedance
        const nextDb = current.currentDb - impedance.lossPerMeter;

        if (nextDb >= threshold.db) {
          const key = `${neighbor.x},${neighbor.y},${neighbor.z}`;
          const existingDb = visited.get(key);
          
          if (existingDb === undefined || nextDb > existingDb) {
            visited.set(key, nextDb);
            queue.push({ coord: neighbor, currentDb: nextDb });
          }
        }
      }
    }

    // Deduplicate audible cells (since a cell could be processed if higher dB path is found later, 
    // though sorting helps mitigate this)
    const uniqueKeys = new Set<string>();
    const uniqueAudible: Coordinate[] = [];
    for (const cell of audible) {
      const key = `${cell.x},${cell.y},${cell.z}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        uniqueAudible.push(cell);
      }
    }

    return uniqueAudible;
  }

  private getNeighbors(coord: Coordinate): Coordinate[] {
    return [
      Coordinate.create(coord.x + 1, coord.y, coord.z)._unsafeUnwrap(),
      Coordinate.create(coord.x - 1, coord.y, coord.z)._unsafeUnwrap(),
      Coordinate.create(coord.x, coord.y + 1, coord.z)._unsafeUnwrap(),
      Coordinate.create(coord.x, coord.y - 1, coord.z)._unsafeUnwrap(),
      // Diagonals could be added, but orthogonal is sufficient for MVP
    ];
  }
}

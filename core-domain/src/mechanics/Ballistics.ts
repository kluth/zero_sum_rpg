import { Coordinate } from '../optics/Coordinate';
import { Velocity } from './Velocity';
import { Mass } from './Mass';

export interface Trajectory {
  path: Coordinate[];
  collisionPoint: Coordinate | null;
}

export class Ballistics {
  // Simple linear raycasting for MVP. Advanced versions would include gravity (z-axis drop) and air resistance.
  public calculateTrajectory(origin: Coordinate, velocity: Velocity, mass: Mass): Trajectory {
    const path: Coordinate[] = [origin];
    
    // Determine number of steps based on velocity magnitude (rough estimation)
    const steps = Math.max(1, Math.floor(velocity.magnitude()));
    
    // Step sizes
    const stepX = velocity.dx / steps;
    const stepY = velocity.dy / steps;
    const stepZ = velocity.dz / steps;

    for (let i = 1; i <= steps; i++) {
      const x = origin.x + stepX * i;
      const y = origin.y + stepY * i;
      const z = origin.z + stepZ * i;
      
      const nextCoordResult = Coordinate.create(Math.round(x), Math.round(y), Math.round(z));
      if (nextCoordResult.isOk()) {
        path.push(nextCoordResult.value);
      }
    }

    return {
      path,
      collisionPoint: null // Collision detection would query Topology Agent here
    };
  }
}

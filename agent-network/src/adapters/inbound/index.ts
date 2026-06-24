import { GrpcOpticsServer } from './GrpcOpticsServer';
import { GrpcTopologyServer } from './GrpcTopologyServer';
import { GrpcAcousticsServer } from './GrpcAcousticsServer';
import { GrpcMechanicsServer } from './GrpcMechanicsServer';

console.log("Starting Zero Sum RPG Agentic Network...");

try {
  new GrpcOpticsServer().start(50051);
  new GrpcTopologyServer().start(50052);
  new GrpcAcousticsServer().start(50053);
  new GrpcMechanicsServer().start(50054);
} catch (e) {
  console.error("Failed to start Agentic Network", e);
}

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { CalculateTrajectoryQueryHandler } from 'core-domain/src/mechanics/ports/in/CalculateTrajectoryQueryHandler';
import { Ballistics } from 'core-domain/src/mechanics/Ballistics';

const PROTO_PATH = path.resolve(__dirname, '../../../../contracts/protobuf/mechanics.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { 
  keepCase: true, 
  longs: String, 
  enums: String, 
  defaults: true, 
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../../contracts/protobuf')]
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const mechanicsProto = protoDescriptor.zero_sum.mechanics;

export class GrpcMechanicsServer {
  private server: grpc.Server;
  private trajectoryHandler: CalculateTrajectoryQueryHandler;

  constructor() {
    this.server = new grpc.Server();
    this.trajectoryHandler = new CalculateTrajectoryQueryHandler(new Ballistics());

    this.server.addService(mechanicsProto.MechanicsService.service, {
      CalculateTrajectory: this.calculateTrajectory.bind(this),
      CalculateEncumbrance: this.calculateEncumbrance.bind(this)
    });
  }

  private calculateTrajectory(call: any, callback: any) {
    const result = this.trajectoryHandler.execute({
      originX: call.request.origin.x,
      originY: call.request.origin.y,
      originZ: call.request.origin.z,
      velDx: call.request.velocity.dx,
      velDy: call.request.velocity.dy,
      velDz: call.request.velocity.dz,
      massKg: call.request.mass.kg
    });
    
    if (result.isErr()) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: result.error.message });
    }

    callback(null, { 
      path: result.value.path, 
      collision_point: result.value.collisionPoint 
    });
  }

  private calculateEncumbrance(call: any, callback: any) {
    // Basic logic directly here for now, would ideally be in a QueryHandler
    const weight = call.request.total_weight.kg;
    const base = call.request.base_movement_range;
    const penalty = call.request.injury_penalty;
    
    const actual = Math.max(1, base - Math.floor(weight / 10) - penalty);
    callback(null, { actual_movement_range: actual });
  }

  public start(port: number = 50054) {
    this.server.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) { console.error(err); return; }
      this.server.start();
      console.log(`Mechanics gRPC Agent listening on port ${port}`);
    });
  }
}

if (require.main === module) {
  new GrpcMechanicsServer().start();
}

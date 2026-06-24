import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { CalculateFOVQueryHandler } from 'core-domain/src/optics/ports/in/CalculateFOVQueryHandler';
import { Shadowcaster } from 'core-domain/src/optics/Shadowcaster';
import { OpticalTopology } from 'core-domain/src/optics/Shadowcaster';
import { Coordinate } from 'core-domain/src/optics/Coordinate';
import { OpticalImpedance } from 'core-domain/src/optics/OpticalImpedance';
// OpenTelemetry could be initialized here if needed

// Mock Topology for demonstration. In a real system, this would call TopologyRepositoryPort.
class GrpcMockTopology implements OpticalTopology {
  getImpedance(coord: Coordinate): OpticalImpedance {
    return OpticalImpedance.create(0.0)._unsafeUnwrap();
  }
}

const PROTO_PATH = path.resolve(__dirname, '../../../../contracts/protobuf/optics.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const opticsProto = protoDescriptor.zero_sum.optics;

export class GrpcOpticsServer {
  private server: grpc.Server;
  private handler: CalculateFOVQueryHandler;

  constructor() {
    this.server = new grpc.Server();
    const topology = new GrpcMockTopology();
    const shadowcaster = new Shadowcaster(topology);
    this.handler = new CalculateFOVQueryHandler(shadowcaster);

    this.server.addService(opticsProto.OpticsService.service, {
      CalculateFieldOfView: this.calculateFieldOfView.bind(this)
    });
  }

  private calculateFieldOfView(call: any, callback: any) {
    const request = call.request;
    const origin = request.origin;
    const range = request.range_meters;

    const result = this.handler.execute({
      originX: origin.x,
      originY: origin.y,
      range: range
    });

    if (result.isErr()) {
      callback(null, {
        error: {
          code: 'INVALID_QUERY',
          message: result.error.message
        }
      });
      return;
    }

    callback(null, {
      fov: {
        visible_cells: result.value.visibleCells
      }
    });
  }

  public start(port: number = 50051) {
    this.server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
      console.log(`Optics gRPC Agent listening on port ${port}`);
    });
  }
}

if (require.main === module) {
  const server = new GrpcOpticsServer();
  server.start();
}

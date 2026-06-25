import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { SoundPropagationQueryHandler } from 'core-domain/src/acoustics/ports/in/SoundPropagationQueryHandler';
import { SoundPropagation, AcousticTopology } from 'core-domain/src/acoustics/SoundPropagation';
import { Coordinate } from 'core-domain/src/optics/Coordinate';
import { AcousticImpedance } from 'core-domain/src/acoustics/AcousticImpedance';

class DummyAcousticTopology implements AcousticTopology {
  getImpedance(coord: Coordinate): AcousticImpedance {
    return AcousticImpedance.create(0.5)._unsafeUnwrap();
  }
}

const PROTO_PATH = path.resolve(__dirname, '../../../../contracts/protobuf/acoustics.proto');
// Add topology.proto to include paths since acoustics.proto imports it
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { 
  keepCase: true, 
  longs: String, 
  enums: String, 
  defaults: true, 
  oneofs: true,
  includeDirs: [path.resolve(__dirname, '../../../../contracts/protobuf')]
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const acousticsProto = protoDescriptor.zero_sum.acoustics;

export class GrpcAcousticsServer {
  private server: grpc.Server;
  private handler: SoundPropagationQueryHandler;

  constructor() {
    this.server = new grpc.Server();
    this.handler = new SoundPropagationQueryHandler(new SoundPropagation(new DummyAcousticTopology()));

    this.server.addService(acousticsProto.AcousticsService.service, {
      GetHearingRange: this.getHearingRange.bind(this)
    });
  }

  private getHearingRange(call: any, callback: any) {
    const result = this.handler.execute({
      originX: call.request.origin.x,
      originY: call.request.origin.y,
      originZ: call.request.origin.z,
      sourceDb: call.request.source_intensity.db,
      thresholdDb: call.request.hearing_threshold.db
    });
    
    if (result.isErr()) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: result.error.message });
    }

    callback(null, { audible_cells: result.value.audibleCells });
  }

  public start(port: number = 50053) {
    this.server.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) { console.error(err); return; }
      this.server.start();
      console.log(`Acoustics gRPC Agent listening on port ${port}`);
    });
  }
}

if (require.main === module) {
  new GrpcAcousticsServer().start();
}

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { GetTopologyQueryHandler } from 'core-domain/src/topology/ports/in/GetTopologyQueryHandler';
import { TopologyRepositoryPort, BoundingBox } from 'core-domain/src/topology/ports/out/TopologyRepositoryPort';
import { Coordinate } from 'core-domain/src/optics/Coordinate';
import { Voxel } from 'core-domain/src/topology/Voxel';
import { Material, MaterialType } from 'core-domain/src/topology/Material';
import { ok, Result } from 'neverthrow';

class DummyTopologyRepo implements TopologyRepositoryPort {
  getVoxelsInBounds(bounds: BoundingBox): Result<Voxel[], Error> {
    const voxels: Voxel[] = [];
    const coord = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const material = Material.create(MaterialType.AIR)._unsafeUnwrap();
    voxels.push(Voxel.create(coord, material, 1.0)._unsafeUnwrap());
    return ok(voxels);
  }
}

const PROTO_PATH = path.resolve(__dirname, '../../../../contracts/protobuf/topology.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const topologyProto = protoDescriptor.zero_sum.topology;

export class GrpcTopologyServer {
  private server: grpc.Server;
  private handler: GetTopologyQueryHandler;

  constructor() {
    this.server = new grpc.Server();
    this.handler = new GetTopologyQueryHandler(new DummyTopologyRepo());

    this.server.addService(topologyProto.TopologyService.service, {
      GetTopology: this.getTopology.bind(this)
    });
  }

  private getTopology(call: any, callback: any) {
    const min = Coordinate.create(call.request.bounds.min.x, call.request.bounds.min.y, call.request.bounds.min.z)._unsafeUnwrap();
    const max = Coordinate.create(call.request.bounds.max.x, call.request.bounds.max.y, call.request.bounds.max.z)._unsafeUnwrap();
    
    const result = this.handler.execute({ min, max });
    
    if (result.isErr()) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, message: result.error.message });
    }

    const voxels = result.value.map(v => ({
      position: { x: v.position.x, y: v.position.y, z: v.position.z },
      material: v.material.type,
      structural_integrity: v.structuralIntegrity
    }));

    callback(null, { voxels });
  }

  public start(port: number = 50052) {
    this.server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
      console.log(`Topology gRPC Agent listening on port ${port}`);
    });
  }
}

if (require.main === module) {
  new GrpcTopologyServer().start();
}

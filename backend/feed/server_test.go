package feed

import (
	"context"
	"net"
	"testing"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/test/bufconn"

	pb "zero_sum_rpg_backend/api/feed"
	"zero_sum_rpg_backend/domain"
)

const bufSize = 1024 * 1024

var lis *bufconn.Listener

func init() {
	lis = bufconn.Listen(bufSize)
	s := grpc.NewServer()
	h := domain.NewHandler()
	srv := NewServer(h)
	pb.RegisterFeedServiceServer(s, srv)
	go func() {
		if err := s.Serve(lis); err != nil {
			panic(err)
		}
	}()
}

func bufDialer(context.Context, string) (net.Conn, error) {
	return lis.Dial()
}

func TestStreamQuests(t *testing.T) {
	ctx := context.Background()
	conn, err := grpc.NewClient("passthrough://bufnet", grpc.WithContextDialer(bufDialer), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		t.Fatalf("Failed to dial bufnet: %v", err)
	}
	defer conn.Close()

	client := pb.NewFeedServiceClient(conn)

	req := &pb.FeedRequest{PlayerId: "p1"}

	streamCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	stream, err := client.StreamQuests(streamCtx, req)
	if err != nil {
		t.Fatalf("StreamQuests failed: %v", err)
	}

	event, err := stream.Recv()
	if err != nil {
		t.Fatalf("Failed to receive event: %v", err)
	}

	if event.Network != pb.NetworkID_WHISPERNET {
		t.Errorf("expected WHISPERNET network, got %v", event.Network)
	}
	if event.Reward != 500 {
		t.Errorf("expected 500 reward, got %v", event.Reward)
	}
}

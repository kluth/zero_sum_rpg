package feed

import (
	"log"
	"time"

	"google.golang.org/grpc"

	pb "zero_sum_rpg_backend/api/feed"
	"zero_sum_rpg_backend/domain"
)

type Server struct {
	pb.UnimplementedFeedServiceServer
	handler *domain.Handler
}

func NewServer(h *domain.Handler) *Server {
	return &Server{
		handler: h,
	}
}

func (s *Server) StreamQuests(req *pb.FeedRequest, stream pb.FeedService_StreamQuestsServer) error {
	log.Printf("Starting stream for player: %s", req.PlayerId)

	ctx := stream.Context()
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("Stream closed by client: %s", req.PlayerId)
			return nil
		case <-ticker.C:
			event := &pb.QuestEvent{
				QuestId:     "q_" + time.Now().Format("150405"),
				Title:       "Live Operation",
				Description: "New orders received.",
				Network:     pb.NetworkID_WHISPERNET,
				State:       pb.QuestState_AVAILABLE,
				Reward:      500,
				Timestamp:   time.Now().Format(time.RFC3339),
			}

			if err := stream.Send(event); err != nil {
				log.Printf("Error sending to stream for player %s: %v", req.PlayerId, err)
				return err
			}
		}
	}
}

func Register(grpcServer *grpc.Server, srv pb.FeedServiceServer) {
	pb.RegisterFeedServiceServer(grpcServer, srv)
}

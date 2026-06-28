package feed

import (
	"context"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"

	pb "zero_sum_rpg_backend/api/feed"
)

var tracer = otel.Tracer("zero_sum_rpg/feed")

// TraceBroadcast creates a span for a news broadcast (quest event)
func TraceBroadcast(ctx context.Context, event *pb.QuestEvent) (context.Context, trace.Span) {
	ctx, span := tracer.Start(ctx, "BroadcastQuestEvent")

	span.SetAttributes(
		attribute.String("quest.id", event.QuestId),
		attribute.String("quest.title", event.Title),
		attribute.String("quest.network", event.Network.String()),
		attribute.String("quest.state", event.State.String()),
		attribute.Int("quest.reward", int(event.Reward)),
	)

	return ctx, span
}

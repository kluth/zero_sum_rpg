package domain

import (
	"crypto/rand"
	"encoding/hex"
)

// GeneratedQuestPayload represents the raw structured output from the AI engine.
type GeneratedQuestPayload struct {
	Title           string
	Description     string
	SuggestedReward int
}

// AIEngine is the Port interface for connecting to Vertex AI or Genkit.
type AIEngine interface {
	GenerateQuestPayload(context string) Result[GeneratedQuestPayload]
}

// QuestGeneratorService orchestrates the creation of Quests using the AIEngine.
type QuestGeneratorService struct {
	engine AIEngine
}

// NewQuestGeneratorService creates a new instance of the generator service.
func NewQuestGeneratorService(engine AIEngine) *QuestGeneratorService {
	return &QuestGeneratorService{engine: engine}
}

// GenerateQuest uses the AI engine to generate a quest and maps it to a Domain Entity.
func (s *QuestGeneratorService) GenerateQuest(narrativeContext string) Result[*Quest] {
	payloadRes := s.engine.GenerateQuestPayload(narrativeContext)
	if !payloadRes.IsOk() {
		// Bubble up the error via Result pattern
		return Err[*Quest](payloadRes.Err)
	}

	payload := payloadRes.Value
	id := generateSecureID()

	quest := NewQuest(id, payload.Title, payload.Description, payload.SuggestedReward)
	
	return Ok(quest)
}

// Helper to generate a dummy secure ID (in a real system, use UUIDv4)
func generateSecureID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "fallback-id-0000"
	}
	return hex.EncodeToString(bytes)
}

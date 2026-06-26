package domain
import (
	"errors"
	"testing"
)

// MockAIEngine is a test double for the AIEngine port
type MockAIEngine struct {
	ShouldFail bool
	MockTitle  string
	MockDesc   string
}

func (m *MockAIEngine) GenerateQuestPayload(context string) Result[GeneratedQuestPayload] {
	if m.ShouldFail {
		return Err[GeneratedQuestPayload](errors.New("AI timeout"))
	}
	return Ok(GeneratedQuestPayload{
		Title:       m.MockTitle,
		Description: m.MockDesc,
		SuggestedReward: 500,
	})
}

func TestQuestGeneratorService_GenerateQuest(t *testing.T) {
	t.Run("Successfully generates quest", func(t *testing.T) {
		mockAI := &MockAIEngine{
			MockTitle: "Infiltrate the Nexus",
			MockDesc:  "Bypass the corporate firewall.",
		}
		service := NewQuestGeneratorService(mockAI)

		res := service.GenerateQuest("A stealth mission in sector 4")

		if !res.IsOk() {
			t.Fatalf("Expected OK, got error: %v", res.Err)
		}

		quest := res.Value
		if quest.Title != "Infiltrate the Nexus" {
			t.Errorf("Expected title 'Infiltrate the Nexus', got %s", quest.Title)
		}
		if quest.State != QuestStateAvailable {
			t.Errorf("Expected state Available, got %v", quest.State)
		}
		if quest.Reward != 500 {
			t.Errorf("Expected reward 500, got %d", quest.Reward)
		}
	})

	t.Run("Fails when AI Engine fails", func(t *testing.T) {
		mockAI := &MockAIEngine{ShouldFail: true}
		service := NewQuestGeneratorService(mockAI)

		res := service.GenerateQuest("A stealth mission in sector 4")

		if res.IsOk() {
			t.Fatal("Expected Error, got OK")
		}
	})
}

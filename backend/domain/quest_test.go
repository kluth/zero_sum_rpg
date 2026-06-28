package domain

import "testing"

func TestQuest_StateTransitions(t *testing.T) {
	t.Run("successful flow", func(t *testing.T) {
		q := NewQuest("q1", "Hack the Gibson", "Find the Gibson and hack it", 500)
		if q.State != QuestStateAvailable {
			t.Errorf("expected available, got %v", q.State)
		}

		res := q.Start()
		if !res.IsOk() || q.State != QuestStateInProgress {
			t.Errorf("expected in progress after start")
		}

		res = q.Complete()
		if !res.IsOk() || q.State != QuestStateCompleted {
			t.Errorf("expected completed after complete")
		}
	})

	t.Run("invalid start", func(t *testing.T) {
		q := NewQuest("q1", "Hack the Gibson", "Find the Gibson and hack it", 500)
		q.Start()
		res := q.Start() // Already in progress
		if res.IsOk() || res.Err != ErrInvalidStateTransition {
			t.Errorf("expected invalid state transition error, got %v", res.Err)
		}
	})

	t.Run("fail quest", func(t *testing.T) {
		q := NewQuest("q1", "Hack the Gibson", "Find the Gibson and hack it", 500)
		q.Start()
		res := q.Fail()
		if !res.IsOk() || q.State != QuestStateFailed {
			t.Errorf("expected failed after fail")
		}
	})

	t.Run("accept quest", func(t *testing.T) {
		q := NewQuest("q1", "Hack the Gibson", "Find the Gibson and hack it", 500)

		res := q.AcceptQuest("player-123")
		if !res.IsOk() {
			t.Fatalf("expected accept to succeed, got %v", res.Err)
		}

		if q.AssigneeID != "player-123" {
			t.Errorf("expected assignee player-123, got %s", q.AssigneeID)
		}

		if q.State != QuestStateInProgress {
			t.Errorf("expected state in progress, got %v", q.State)
		}

		res2 := q.AcceptQuest("player-456")
		if res2.IsOk() {
			t.Errorf("expected failure when accepting already accepted quest")
		}
	})
}

package domain

import "errors"

var (
	ErrInvalidStateTransition = errors.New("invalid state transition")
)

type QuestState int

const (
	QuestStateUnknown QuestState = iota
	QuestStateAvailable
	QuestStateInProgress
	QuestStateCompleted
	QuestStateFailed
)

type Quest struct {
	ID          string
	Title       string
	Description string
	State       QuestState
	Reward      int
	AssigneeID  string
}

func NewQuest(id, title, description string, reward int) *Quest {
	return &Quest{
		ID:          id,
		Title:       title,
		Description: description,
		State:       QuestStateAvailable,
		Reward:      reward,
	}
}

func (q *Quest) Start() Result[struct{}] {
	if q.State != QuestStateAvailable {
		return Err[struct{}](ErrInvalidStateTransition)
	}
	q.State = QuestStateInProgress
	return Ok(struct{}{})
}

func (q *Quest) AcceptQuest(playerID string) Result[struct{}] {
	if q.State != QuestStateAvailable {
		return Err[struct{}](ErrInvalidStateTransition)
	}
	q.AssigneeID = playerID
	q.State = QuestStateInProgress
	return Ok(struct{}{})
}

func (q *Quest) Complete() Result[struct{}] {
	if q.State != QuestStateInProgress {
		return Err[struct{}](ErrInvalidStateTransition)
	}
	q.State = QuestStateCompleted
	return Ok(struct{}{})
}

func (q *Quest) Fail() Result[struct{}] {
	if q.State != QuestStateInProgress {
		return Err[struct{}](ErrInvalidStateTransition)
	}
	q.State = QuestStateFailed
	return Ok(struct{}{})
}

// CancelQuest is a GM override to forcefully unassign and reset a quest
func (q *Quest) CancelQuest() Result[struct{}] {
	if q.State != QuestStateInProgress {
		return Err[struct{}](ErrInvalidStateTransition)
	}
	q.AssigneeID = ""
	q.State = QuestStateAvailable
	return Ok(struct{}{})
}

package db

import (
	"errors"
	"sync"
	"zero_sum_rpg_backend/domain"
)

var ErrPlayerNotFound = errors.New("player not found in database")

// InMemoryPlayerRepository is a thread-safe adapter simulating Firestore.
type InMemoryPlayerRepository struct {
	mu      sync.RWMutex
	storage map[string]*domain.Player
}

func NewInMemoryPlayerRepository() *InMemoryPlayerRepository {
	return &InMemoryPlayerRepository{
		storage: make(map[string]*domain.Player),
	}
}

// Save persists the player state.
func (r *InMemoryPlayerRepository) Save(player *domain.Player) domain.Result[struct{}] {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Deep copy to prevent pointer mutation outside repository
	copy := *player
	r.storage[player.ID] = &copy

	return domain.Ok(struct{}{})
}

// FindByID retrieves the player state.
func (r *InMemoryPlayerRepository) FindByID(id string) domain.Result[*domain.Player] {
	r.mu.RLock()
	defer r.mu.RUnlock()

	p, exists := r.storage[id]
	if !exists {
		return domain.Err[*domain.Player](ErrPlayerNotFound)
	}

	// Return a copy to prevent accidental mutation without Save()
	copy := *p
	return domain.Ok(&copy)
}

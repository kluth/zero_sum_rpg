package domain

// PlayerRepository defines the port for persisting Player entities.
type PlayerRepository interface {
	Save(player *Player) Result[struct{}]
	FindByID(id string) Result[*Player]
}

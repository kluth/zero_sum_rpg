package main

import (
	"fmt"
	"math/rand"
	"time"

	"zero_sum_rpg_backend/domain"
)

// RandomRNGEngine implements domain.RNGEngine with actual randomness
type RandomRNGEngine struct {
	r *rand.Rand
}

func (e *RandomRNGEngine) Roll2D6() int {
	return e.r.Intn(6) + 1 + e.r.Intn(6) + 1
}

// MockAI implements domain.AIEngine locally for speed
type MockAI struct{}

func (m *MockAI) GenerateQuestPayload(context string) domain.Result[domain.GeneratedQuestPayload] {
	return domain.Ok(domain.GeneratedQuestPayload{
		Title:           "Satelliten-Daten-Engpass (Simulation)",
		Description:     "Übertrage kritische Hilfsdaten.",
		SuggestedReward: 500,
	})
}

func main() {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	resEngine := domain.NewResolutionEngine(&RandomRNGEngine{r: rng})
	aiEngine := &MockAI{}
	questGen := domain.NewQuestGeneratorService(aiEngine)

	successes := 0
	panics := 0
	logicErrors := 0

	for i := 1; i <= 50; i++ {
		err := runSession(i, resEngine, questGen)
		if err != nil {
			fmt.Printf("Session %d ERROR: %v\n", i, err)
			logicErrors++
		} else {
			successes++
		}
	}

	fmt.Printf("\n--- SATELLITEN-DATENÜBERTRAGUNG (KRISENGEBIET) ---\n")
	fmt.Printf("Total Sessions: 50\n")
	fmt.Printf("Successes: %d\n", successes)
	fmt.Printf("Logic Errors Found: %d\n", logicErrors)
	fmt.Printf("Panics: %d\n", panics)
}

func runSession(sessionID int, resEngine *domain.ResolutionEngine, questGen *domain.QuestGeneratorService) error {
	player := domain.NewPlayer(fmt.Sprintf("player-%d", sessionID), "IT-Techniker")

	// 1. Generate Quest
	questRes := questGen.GenerateQuest("Hilfsorganisation XYZ")
	if !questRes.IsOk() {
		return fmt.Errorf("quest generation failed: %v", questRes.Err)
	}
	quest := questRes.Value

	// 2. Accept Quest
	acceptRes := quest.AcceptQuest(player.ID)
	if !acceptRes.IsOk() {
		return fmt.Errorf("failed to accept quest: %v", acceptRes.Err)
	}

	// 3. Perform Actions to solve it
	action := domain.Action{ID: "hack-1", Name: "Satellitenverbindung herstellen", APCost: 4, HeatGenerated: 2}
	execRes := player.ExecuteAction(action)
	if !execRes.IsOk() {
		return fmt.Errorf("failed to execute action: %v", execRes.Err)
	}

	// 4. Resolve Quest
	skillCheck := domain.SkillCheck{BaseStat: 2, SkillBonus: 1, TargetNumber: 8}
	outcomeRes := resEngine.Evaluate(skillCheck)
	if !outcomeRes.IsOk() {
		return fmt.Errorf("resolution failed: %v", outcomeRes.Err)
	}

	// 5. Complete or Fail Quest based on outcome
	if outcomeRes.Value == domain.OutcomeSuccess || outcomeRes.Value == domain.OutcomeCriticalSuccess {
		compRes := quest.Complete()
		if !compRes.IsOk() {
			return fmt.Errorf("failed to complete quest: %v", compRes.Err)
		}
		player.AddCredits(quest.Reward)
	} else {
		failRes := quest.Fail()
		if !failRes.IsOk() {
			return fmt.Errorf("failed to fail quest: %v", failRes.Err)
		}
	}

	// 6. Buy an item with reward
	if player.Credits >= 200 {
		spendRes := player.SpendCredits(200)
		if !spendRes.IsOk() {
			return fmt.Errorf("failed to spend credits: %v", spendRes.Err)
		}
		itemRes := player.AddItem(domain.Item{ID: "i-1", Name: "Besseres Satellitentelefon", Type: domain.ItemTypeHardware})
		if !itemRes.IsOk() {
			return fmt.Errorf("failed to add item: %v", itemRes.Err)
		}
	}

	// Edge Case 1: Exhaust AP
	for i := 0; i < 5; i++ {
		player.ExecuteAction(domain.Action{ID: "exhaust", APCost: 10})
	}
	// The last one MUST fail because player only has 10 starting AP.
	// But it shouldn't crash.
	resExhaust := player.ExecuteAction(domain.Action{ID: "exhaust", APCost: 10})
	if resExhaust.IsOk() {
		return fmt.Errorf("engine allowed AP to drop below 0")
	}
	if resExhaust.Err != domain.ErrInsufficientAP {
		return fmt.Errorf("engine returned wrong error for AP exhaustion: %v", resExhaust.Err)
	}

	// Edge Case 2: Accept already accepted quest
	resDoubleAccept := quest.AcceptQuest("another-player")
	if resDoubleAccept.IsOk() {
		return fmt.Errorf("engine allowed a quest to be accepted twice")
	}

	// Edge Case 3: Overspend credits
	resOverspend := player.SpendCredits(999999)
	if resOverspend.IsOk() {
		return fmt.Errorf("engine allowed overspending credits")
	}

	// Edge Case 4: Everyday Hero Team Limits and Verzweiflungs-Aktion (Trauma/Abstumpfung)
	team := domain.NewTeam("t-1", "Krisen-Interventionsteam")
	char1 := domain.NewCharacter(200, domain.ClassStandard)
	_ = char1.LearnSkill("Improvisierte Antenne", 100)

	char2 := domain.NewCharacter(100, domain.ClassSupport)
	_ = char2.LearnSkill("Krisen-Management", 60)

	team.AddCharacter(char1)
	team.AddCharacter(char2)

	// char1 uses 100
	// char2 uses 60 - 15 (shadow cache) = 45
	// Total = 145. Limit is 150. Not in Verzweiflungs-Aktion yet.
	if team.IsInVerzweiflungsAktion() {
		return fmt.Errorf("system wrongly flagged the crew as in Verzweiflungs-Aktion - they are hanging on by a thread")
	}

	// Push the system too hard
	_ = char1.LearnSkill("Riskante Notübertragung", 20) // Total now 165
	if !team.IsInVerzweiflungsAktion() {
		return fmt.Errorf("system failed to flag critical Verzweiflungs-Aktion - das Team sollte zusammenbrechen")
	}

	// The crew pays the price for pushing their limits
	team.ApplyVerzweiflungsAktionTrauma()

	if char1.SkillLevel("Improvisierte Antenne") != 99 {
		return fmt.Errorf("Trauma/Abstumpfung was not applied properly to standard class - sie sollten abstumpfen")
	}
	if char2.SkillLevel("Krisen-Management") != 59 {
		return fmt.Errorf("Trauma/Abstumpfung was not applied properly to support class")
	}

	return nil
}

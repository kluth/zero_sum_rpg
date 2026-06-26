package ai

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestVertexAIEngine_GenerateQuestPayload_Success(t *testing.T) {
	// Mock the Gemini API server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		// Mock Gemini JSON response containing our payload
		w.Write([]byte(`{
			"candidates": [{
				"content": {
					"parts": [{
						"text": "{\"Title\": \"Hack the Gibson\", \"Description\": \"A daring raid.\", \"SuggestedReward\": 1000}"
					}]
				}
			}]
		}`))
	}))
	defer server.Close()

	engine := NewVertexAIEngine("fake-key", server.URL)
	res := engine.GenerateQuestPayload("Cyberpunk city")

	if !res.IsOk() {
		t.Fatalf("expected success, got %v", res.Err)
	}

	if res.Value.Title != "Hack the Gibson" {
		t.Errorf("expected 'Hack the Gibson', got %s", res.Value.Title)
	}
	if res.Value.SuggestedReward != 1000 {
		t.Errorf("expected 1000, got %d", res.Value.SuggestedReward)
	}
}

func TestVertexAIEngine_GenerateQuestPayload_HTTPError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	engine := NewVertexAIEngine("fake-key", server.URL)
	res := engine.GenerateQuestPayload("Cyberpunk city")

	if res.IsOk() {
		t.Fatal("expected failure on 500 status")
	}
}

func TestVertexAIEngine_APIKey_Fallback(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "env-fake-key")
	engine := NewVertexAIEngine("", "")
	if engine.apiKey != "env-fake-key" {
		t.Errorf("expected engine.apiKey to fall back to env-fake-key, got %s", engine.apiKey)
	}
}

package ai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"zero_sum_rpg_backend/domain"
)

type VertexAIEngine struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

// NewVertexAIEngine initializes the adapter. If baseURL is empty, it uses the default Gemini endpoint.
func NewVertexAIEngine(apiKey, baseURL string) *VertexAIEngine {
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
	}
	return &VertexAIEngine{
		apiKey:  apiKey,
		baseURL: baseURL,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (e *VertexAIEngine) GenerateQuestPayload(context string) domain.Result[domain.GeneratedQuestPayload] {
	prompt := fmt.Sprintf(`Generate a quest for a cyberpunk RPG based on: "%s".
Return strictly valid JSON with no markdown formatting.
Format: {"Title": "string", "Description": "string", "SuggestedReward": number}`, context)

	reqBody := map[string]interface{}{
		"contents": []map[string]interface{}{
			{"parts": []map[string]string{{"text": prompt}}},
		},
	}
	bodyBytes, _ := json.Marshal(reqBody)

	url := fmt.Sprintf("%s?key=%s", e.baseURL, e.apiKey)
	resp, err := e.client.Post(url, "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		return domain.Err[domain.GeneratedQuestPayload](err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return domain.Err[domain.GeneratedQuestPayload](errors.New("AI API returned non-200 status"))
	}

	return parseGeminiResponse(resp.Body)
}

func parseGeminiResponse(body io.Reader) domain.Result[domain.GeneratedQuestPayload] {
	var payload struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(body).Decode(&payload); err != nil {
		return domain.Err[domain.GeneratedQuestPayload](err)
	}

	if len(payload.Candidates) == 0 || len(payload.Candidates[0].Content.Parts) == 0 {
		return domain.Err[domain.GeneratedQuestPayload](errors.New("empty AI response"))
	}

	rawJSON := payload.Candidates[0].Content.Parts[0].Text
	rawJSON = strings.TrimPrefix(rawJSON, "```json\n")
	rawJSON = strings.TrimSuffix(rawJSON, "\n```")

	var quest domain.GeneratedQuestPayload
	if err := json.Unmarshal([]byte(rawJSON), &quest); err != nil {
		return domain.Err[domain.GeneratedQuestPayload](err)
	}

	return domain.Ok(quest)
}

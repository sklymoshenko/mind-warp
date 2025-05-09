package types

import "time"

type UserServer struct {
	ID        string    `json:"id"`
	Name      string    `json:"name,omitempty"`
	Email     string    `json:"email,omitempty"`
	Password  string    `json:"password,omitempty"`
	IsAdmin   bool      `json:"is_admin,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

type GameTemplateServer struct {
	ID          string    `json:"id"`
	CreatorID   string    `json:"creator_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsPublic    bool      `json:"is_public"`
	CreatedAt   time.Time `json:"created_at"`
}

type TimeSettings struct {
	ID         uint16 `json:"id"`
	Label      string `json:"label"`
	IsSelected bool   `json:"is_selected"`
}

type RankSettings struct {
	ID         uint16 `json:"id"`
	Label      string `json:"label"`
	IsSelected bool   `json:"is_selected"`
}

type TemplateRoundServer struct {
	ID             string         `json:"id"`
	GameTemplateID string         `json:"game_template_id"`
	Name           string         `json:"name"`
	TimeSettings   TimeSettings   `json:"time_settings"`
	RankSettings   []RankSettings `json:"rank_settings"`
	Position       int            `json:"position"`
}

type TemplateThemeServer struct {
	ID       string `json:"id"`
	RoundID  string `json:"round_id"`
	Name     string `json:"name"`
	Position int    `json:"position"`
}

type TemplateQuestionServer struct {
	ID       string `json:"id"`
	ThemeID  string `json:"theme_id"`
	Text     string `json:"text"`
	Answer   string `json:"answer"`
	Points   int    `json:"points"`
	Position int    `json:"position"`
}

type GameServer struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	CreatorID         string    `json:"creator_id"`
	TemplateID        string    `json:"template_id"`
	IsFinished        bool      `json:"is_finished"`
	WinnerID          string    `json:"winner_id"`
	FinishDate        time.Time `json:"finish_date"`
	CurrentRoundID    string    `json:"current_round_id"`
	CurrentQuestionID string    `json:"current_question_id"`
	CurrentUserID     string    `json:"current_user_id"`
	CreatedAt         time.Time `json:"created_at"`
}

type RoundServer struct {
	ID           string         `json:"id"`
	GameID       string         `json:"game_id"`
	Name         string         `json:"name"`
	TimeSettings TimeSettings   `json:"time_settings"`
	RankSettings []RankSettings `json:"rank_settings"`
	Position     int            `json:"position"`
}

type ThemeServer struct {
	ID       string `json:"id"`
	RoundID  string `json:"round_id"`
	Name     string `json:"name"`
	Position int    `json:"position"`
}

type QuestionServer struct {
	ID        string    `json:"id"`
	ThemeID   string    `json:"theme_id"`
	Text      string    `json:"text"`
	Answer    string    `json:"answer"`
	Points    int       `json:"points"`
	CreatedAt time.Time `json:"created_at"`
}

type GameUserServer struct {
	GameID      string         `json:"game_id"`
	UserID      string         `json:"user_id"`
	RoundScores map[string]any `json:"round_scores"`
}

type AnswerServer struct {
	ID           string    `json:"id"`
	QuestionID   string    `json:"question_id"`
	UserID       string    `json:"user_id"`
	IsCorrect    bool      `json:"is_correct"`
	TimeAnswered int       `json:"time_answered"`
	CreatedAt    time.Time `json:"created_at"`
}

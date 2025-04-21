package db

import "time"

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	IsAdmin   bool      `json:"is_admin"`
	CreatedAt time.Time `json:"created_at"`
}

type GameTemplate struct {
	ID          string    `json:"id"`
	CreatorID   string    `json:"creator_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsPublic    bool      `json:"is_public"`
	CreatedAt   time.Time `json:"created_at"`
}

type TemplateRound struct {
	ID             string         `json:"id"`
	GameTemplateID string         `json:"game_template_id"`
	Name           string         `json:"name"`
	TimeSettings   map[string]any `json:"time_settings"`
	RankSettings   map[string]any `json:"rank_settings"`
	Position       int            `json:"position"`
}

type TemplateTheme struct {
	ID       string `json:"id"`
	RoundID  string `json:"round_id"`
	Name     string `json:"name"`
	Position int    `json:"position"`
}

type TemplateQuestion struct {
	ID       string `json:"id"`
	ThemeID  string `json:"theme_id"`
	Text     string `json:"text"`
	Answer   string `json:"answer"`
	Points   int    `json:"points"`
	Position int    `json:"position"`
}

type Game struct {
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

type Round struct {
	ID           string         `json:"id"`
	GameID       string         `json:"game_id"`
	Name         string         `json:"name"`
	TimeSettings map[string]any `json:"time_settings"`
	RankSettings map[string]any `json:"rank_settings"`
	Position     int            `json:"position"`
}

type Theme struct {
	ID       string `json:"id"`
	RoundID  string `json:"round_id"`
	Name     string `json:"name"`
	Position int    `json:"position"`
}

type Question struct {
	ID        string    `json:"id"`
	ThemeID   string    `json:"theme_id"`
	Text      string    `json:"text"`
	Answer    string    `json:"answer"`
	Points    int       `json:"points"`
	CreatedAt time.Time `json:"created_at"`
}

type GameUser struct {
	GameID      string         `json:"game_id"`
	UserID      string         `json:"user_id"`
	RoundScores map[string]any `json:"round_scores"`
}

type Answer struct {
	ID           string    `json:"id"`
	QuestionID   string    `json:"question_id"`
	UserID       string    `json:"user_id"`
	IsCorrect    bool      `json:"is_correct"`
	TimeAnswered int       `json:"time_answered"`
	CreatedAt    time.Time `json:"created_at"`
}

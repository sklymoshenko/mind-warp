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
	Position       uint16         `json:"position"`
}

type TemplateThemeServer struct {
	ID       string `json:"id"`
	RoundID  string `json:"round_id"`
	Name     string `json:"name"`
	Position uint16 `json:"position"`
}

type TemplateQuestionServer struct {
	ID       string `json:"id"`
	ThemeID  string `json:"theme_id"`
	Text     string `json:"text"`
	Answer   string `json:"answer"`
	Points   uint16 `json:"points"`
	Position uint16 `json:"position"`
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
	Position     uint16         `json:"position"`
}

type ThemeServer struct {
	ID       string `json:"id"`
	RoundID  string `json:"round_id"`
	Name     string `json:"name"`
	Position uint16 `json:"position"`
}

type QuestionServer struct {
	ID        string    `json:"id"`
	ThemeID   string    `json:"theme_id"`
	Text      string    `json:"text"`
	Answer    string    `json:"answer"`
	Points    uint16    `json:"points"`
	CreatedAt time.Time `json:"created_at"`
}

type GameUserServer struct {
	GameID     string           `json:"game_id"`
	UserID     string           `json:"user_id"`
	RoundScore map[string]int16 `json:"round_scores"`
}

type AnswerServer struct {
	ID           string    `json:"id"`
	QuestionID   string    `json:"question_id"`
	UserID       string    `json:"user_id"`
	IsCorrect    bool      `json:"is_correct"`
	TimeAnswered uint16    `json:"time_answered,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type GameInviteServer struct {
	ID        string    `json:"id"`
	GameID    string    `json:"game_id"`
	UserID    string    `json:"user_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

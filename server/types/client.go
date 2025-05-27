package types

import "time"

type RoundRankClient struct {
	Id         uint16 `json:"id"`
	Label      string `json:"label"`
	IsSelected bool   `json:"isSelected"`
}

type RoundTimeClient struct {
	Id         uint16 `json:"id"`
	Label      string `json:"label"`
	IsSelected bool   `json:"isSelected"`
}

type QuestionClient struct {
	Id     string `json:"id"`
	Text   string `json:"text"`
	Answer string `json:"answer"`
	Points uint16 `json:"points"`
}

type ThemeClient struct {
	Id        string           `json:"id"`
	Name      string           `json:"name"`
	Questions []QuestionClient `json:"questions"`
}

type RoundClient struct {
	Id     string            `json:"id"`
	Name   string            `json:"name"`
	Ranks  []RoundRankClient `json:"ranks"`
	Time   RoundTimeClient   `json:"time"`
	Themes []ThemeClient     `json:"themes"`
}

type GameTemplateClient struct {
	Id          string        `json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	IsPublic    bool          `json:"isPublic"`
	Rounds      []RoundClient `json:"rounds"`
	CreatorID   string        `json:"creatorId"`
}

type UserClient struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	IsAdmin     bool             `json:"isAdmin,omitempty"`
	RoundScores map[string]int16 `json:"roundScore"`
}

type UnconfirmedUserClient struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

type GameClient struct {
	ID               string                  `json:"id"`
	TemplateID       string                  `json:"templateId"`
	Name             string                  `json:"name"`
	Users            []UserClient            `json:"users"`
	Rounds           []RoundClient           `json:"rounds"`
	CurrentRound     string                  `json:"currentRound"`
	CurrentQuestion  string                  `json:"currentQuestion"`
	CurrentUser      string                  `json:"currentUser"`
	IsFinished       bool                    `json:"isFinished"`
	Winner           string                  `json:"winner,omitempty"`
	FinishDate       int64                   `json:"finishDate,omitempty"`
	CreatorID        string                  `json:"creatorId"`
	UnconfirmedUsers []UnconfirmedUserClient `json:"unconfirmedUsers,omitempty"`
}

type GameInviteClient struct {
	ID              string    `json:"id"`
	GameID          string    `json:"gameId"`
	UserID          string    `json:"userId"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"createdAt,omitempty"`
	UpdatedAt       time.Time `json:"updatedAt,omitempty"`
	GameName        string    `json:"gameName"`
	GameCreatorName string    `json:"gameCreatorName"`
}

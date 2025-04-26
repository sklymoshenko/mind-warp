package types

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
	Points int    `json:"points"`
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

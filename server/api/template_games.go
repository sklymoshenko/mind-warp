package api

import (
	"mindwarp/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RoundRankBody struct {
	Id         string
	Label      string
	IsSelected bool
}

type RoundTimeBody struct {
	Id         string
	Label      string
	IsSelected bool
}

type QuestionBody struct {
	Id     string
	Text   string
	Answer string
	Points int
}

type ThemeBody struct {
	Id        string
	Name      string
	Questions []QuestionBody
}

type RoundBody struct {
	Id     string
	Name   string
	Ranks  []RoundRankBody
	Time   RoundTimeBody
	Themes []ThemeBody
}

type GameTemplateBody struct {
	Id          string
	Name        string
	Description string
	IsPublic    bool
	Rounds      []RoundBody
}

func processGameTemplateBody(body GameTemplateBody) (db.GameTemplate, []db.TemplateRound, map[string][]db.TemplateTheme, map[string][]db.TemplateQuestion, error) {
	rounds := []db.TemplateRound{}
	themes := map[string][]db.TemplateTheme{}
	questions := map[string][]db.TemplateQuestion{}

	for _, round := range body.Rounds {
		rounds = append(rounds, db.TemplateRound{
			ID:   round.Id,
			Name: round.Name,
			TimeSettings: db.RoundTime{
				ID:         round.Time.Id,
				Label:      round.Time.Label,
				IsSelected: round.Time.IsSelected,
			},
			RankSettings: db.RoundRank{
				ID:         round.Ranks[0].Id,
				Label:      round.Ranks[0].Label,
				IsSelected: round.Ranks[0].IsSelected,
			},
		})
	}
}

func (s *Server) GetAllGames(c *gin.Context) {
	games, err := s.Db.GetAllGames()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get games"})
	}
	c.JSON(http.StatusOK, games)
}

func (s *Server) GetGameByID(c *gin.Context) {
	gameID := c.Param("id")
	game, err := s.Db.GetGameByID(gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game"})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) GetGameByUserID(c *gin.Context) {
	userID := c.Param("id")
	game, err := s.Db.GetGameByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game"})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) SearchGames(c *gin.Context) {
	query := c.Query("query")
	games, err := s.Db.SearchGames(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search games"})
	}
	c.JSON(http.StatusOK, games)
}

func (s *Server) CreateGameTemplate(c *gin.Context) {
	var gameBody GameTemplateBody
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := s.Db.CreateCompleteGameTemplate(gameBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create game template"})
	}
}

func (s *Server) AddGameRoutes(group *gin.RouterGroup) {
	group.GET("/games", s.GetAllGames)
	group.GET("/games/:id", s.GetGameByID)
	group.GET("/games/user/:id", s.GetGameByUserID)
	group.POST("/games/create_template", s.CreateGameTemplate)
}

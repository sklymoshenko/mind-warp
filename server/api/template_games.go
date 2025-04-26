package api

import (
	"mindwarp/logger"
	"mindwarp/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

func mapGameClientToDb(body types.GameTemplateClient) (types.GameTemplateServer, []types.TemplateRoundServer, map[string][]types.TemplateThemeServer, map[string][]types.TemplateQuestionServer, error) {
	rounds := make([]types.TemplateRoundServer, len(body.Rounds))
	themes := make(map[string][]types.TemplateThemeServer)
	questions := make(map[string][]types.TemplateQuestionServer)

	for i, round := range body.Rounds {
		rankSettings := make([]types.RankSettings, len(round.Ranks))
		for j, rank := range round.Ranks {
			rankSettings[j] = types.RankSettings{
				ID:         rank.Id,
				Label:      rank.Label,
				IsSelected: rank.IsSelected,
			}
		}

		rounds[i] = types.TemplateRoundServer{
			ID:             round.Id,
			Name:           round.Name,
			GameTemplateID: body.Id,
			TimeSettings: types.TimeSettings{
				ID:         round.Time.Id,
				Label:      round.Time.Label,
				IsSelected: round.Time.IsSelected,
			},
			RankSettings: rankSettings,
		}

		for j, theme := range round.Themes {
			themes[theme.Id] = append(themes[theme.Id], types.TemplateThemeServer{
				ID:       theme.Id,
				RoundID:  round.Id,
				Name:     theme.Name,
				Position: j,
			})

			for j, question := range theme.Questions {
				questions[question.Id] = append(questions[question.Id], types.TemplateQuestionServer{
					ID:       question.Id,
					ThemeID:  theme.Id,
					Text:     question.Text,
					Answer:   question.Answer,
					Points:   question.Points,
					Position: j,
				})
			}
		}
	}

	return types.GameTemplateServer{
		ID:          body.Id,
		Name:        body.Name,
		Description: body.Description,
		IsPublic:    body.IsPublic,
		CreatorID:   body.CreatorID,
	}, rounds, themes, questions, nil
}

func (s *Server) GetAllGames(c *gin.Context) {
	games, err := s.Db.GetAllGames(c.Request.Context())
	if err != nil {
		logger.Errorf("Failed to get games: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get games: " + err.Error()})
	}
	c.JSON(http.StatusOK, games)
}

func (s *Server) GetGameByID(c *gin.Context) {
	gameID := c.Param("id")
	game, err := s.Db.GetGameByID(c.Request.Context(), gameID)
	if err != nil {
		logger.Errorf("Failed to get game: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game: " + err.Error()})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) GetGameByUserID(c *gin.Context) {
	userID := c.Param("id")
	game, err := s.Db.GetGameByUserID(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get game: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game: " + err.Error()})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) SearchGames(c *gin.Context) {
	query := c.Query("query")
	games, err := s.Db.SearchGames(c.Request.Context(), query)
	if err != nil {
		logger.Errorf("Failed to search games: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search games: " + err.Error()})
	}
	c.JSON(http.StatusOK, games)
}

func (s *Server) CreateGameTemplate(c *gin.Context) {
	var gameBody types.GameTemplateClient
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		logger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	gameTemplate, rounds, themes, questions, err := mapGameClientToDb(gameBody)

	if err != nil {
		logger.Errorf("Failed to map game client to db: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process game template: " + err.Error()})
		return
	}

	err = s.Db.CreateCompleteGameTemplate(c.Request.Context(), gameTemplate, rounds, themes, questions)
	if err != nil {
		logger.Errorf("Failed to create game template: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create game template: " + err.Error()})
	}
}

func (s *Server) AddGameRoutes(group *gin.RouterGroup) {
	group.GET("/games", s.GetAllGames)
	group.GET("/games/:id", s.GetGameByID)
	group.GET("/games/user/:id", s.GetGameByUserID)
	group.POST("/games/create_template", s.CreateGameTemplate)
}

package api

import (
	"mindwarp/logger"
	"mindwarp/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

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

func (s *Server) GetGameByCreatorID(c *gin.Context) {
	userID := c.Param("id")
	game, err := s.Db.GetGameByCreatorID(c.Request.Context(), userID)
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
	gameTemplate, rounds, themes, questions, err := MapGameTemplateClientToDb(gameBody)

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

	c.JSON(http.StatusOK, gin.H{"message": "Game template created successfully"})
}

func (s *Server) GetGameTemplateInfo(c *gin.Context) {
	gameID := c.Param("id")
	game, err := s.Db.GetFullGameTemplateById(c.Request.Context(), gameID)
	if err != nil {
		logger.Errorf("Failed to get game template info: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game template info: " + err.Error()})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) AddGameRoutes(group *gin.RouterGroup) {
	group.GET("/game_templates", s.GetAllGames)
	group.GET("/game_templates/:id", s.GetGameByID)
	group.GET("/game_templates/user/:id", s.GetGameByCreatorID)
	group.GET("/game_templates/info/:id", s.GetGameTemplateInfo)
	group.POST("/game_templates/create_template", s.CreateGameTemplate)
}

package api

import (
	"mindwarp/logger"
	"mindwarp/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) CreateGame(c *gin.Context) {
	var gameBody types.GameClient
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		logger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	game, rounds, themes, questions, users, err := MapGameClientToDb(gameBody)

	if err != nil {
		logger.Errorf("Failed to map game client to db: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process game: " + err.Error()})
		return
	}

	err = s.Db.CreateGame(c.Request.Context(), game, rounds, themes, questions, users)
	if err != nil {
		logger.Errorf("Failed to create game: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create game: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game created successfully"})
}

func (s *Server) GetGameById(c *gin.Context) {
	gameID := c.Param("id")
	game, err := s.Db.GetGameByFilter(c.Request.Context(), "id", gameID)
	if err != nil {
		logger.Errorf("Failed to get game by id: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game by id: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, game)
}

func (s *Server) GetActiveGamesByUserId(c *gin.Context) {
	userId := c.Param("userId")
	games, err := s.Db.GetGameByFilter(c.Request.Context(), "user", userId)
	if err != nil {
		logger.Errorf("Failed to get active games: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active games: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (s *Server) GetFinishedGamesByUserId(c *gin.Context) {
	userId := c.Param("userId")
	games, err := s.Db.GetGameByFilter(c.Request.Context(), "user_finished", userId)
	if err != nil {
		logger.Errorf("Failed to get finished games: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get finished games: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, games)
}

func (s *Server) AddGameRoutes(group *gin.RouterGroup) {
	group.POST("/games/create", s.CreateGame)
	group.GET("/games/:id", s.GetGameById)
	group.GET("/games/active/user/:userId", s.GetActiveGamesByUserId)
	group.GET("/games/finished/user/:userId", s.GetFinishedGamesByUserId)
}

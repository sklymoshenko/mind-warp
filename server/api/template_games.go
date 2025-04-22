package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

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

func (s *Server) AddGameRoutes(group *gin.RouterGroup) {
	group.GET("/games", s.GetAllGames)
	group.GET("/games/:id", s.GetGameByID)
	group.GET("/games/user/:id", s.GetGameByUserID)
}

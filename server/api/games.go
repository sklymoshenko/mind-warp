package api

import (
	"mindwarp/logger"
	"mindwarp/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

type InviteRequest struct {
	InviteID string `json:"inviteId"`
	GameID   string `json:"gameId,omitempty"`
	UserID   string `json:"userId,omitempty"`
}

func (s *Server) CreateGame(c *gin.Context) {
	var gameBody types.GameClient
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		logger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	game, rounds, themes, questions, users, answers, err := MapGameClientToCreate(gameBody)

	if err != nil {
		logger.Errorf("Failed to map game client to db: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process game: " + err.Error()})
		return
	}

	err = s.Db.CreateGame(c.Request.Context(), game, rounds, themes, questions, users, answers)
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

	// Optimize later by creating endpoints for list preview
	for _, game := range games {
		unconfirmedUsers, err := s.Db.GetUnconfirmedUsersByGameId(c.Request.Context(), game.ID)
		if err != nil {
			logger.Errorf("Failed to get pending users by game id: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pending users by game id: " + err.Error()})
			return
		}
		game.UnconfirmedUsers = unconfirmedUsers
	}

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

func (s *Server) RemoveUserFromGame(c *gin.Context) {
	var reqBody AddUserToGameRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := s.Db.RemoveUserFromGame(c.Request.Context(), reqBody.GameID, reqBody.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove user from game: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User removed from game"})
}

func (s *Server) GetGameInvitesByUserId(c *gin.Context) {
	userId := c.Param("userId")
	gameInvites, err := s.Db.GetGameInvitesByUserId(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get game invites: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gameInvites)
}

func (s *Server) AcceptGameInvite(c *gin.Context) {
	var reqBody InviteRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := s.Db.AcceptGameInvite(c.Request.Context(), reqBody.InviteID, reqBody.GameID, reqBody.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept game invite: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game invite accepted"})
}

func (s *Server) DeclineGameInvite(c *gin.Context) {
	var reqBody InviteRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := s.Db.DeclineGameInvite(c.Request.Context(), reqBody.InviteID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept game invite: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game invite declined"})
}

func (s *Server) DeleteGame(c *gin.Context) {
	gameID := c.Param("id")
	err := s.Db.DeleteGame(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete game: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game deleted"})
}

func (s *Server) FinishGame(c *gin.Context) {
	gameID := c.Param("id")
	winningUserID := c.Param("userId")
	err := s.Db.FinishGame(c.Request.Context(), gameID, winningUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finish game: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game finished"})
}

func (s *Server) UpdateGame(c *gin.Context) {
	var gameBody types.GameClient
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	game, users, answers, err := MapGameClientToUpdate(gameBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to map game client to db: " + err.Error()})
		return
	}

	err = s.Db.UpdateGameAndGameUsers(c.Request.Context(), game, users, answers)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update game: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game updated"})
}

func (s *Server) AddGameRoutes(group *gin.RouterGroup) {
	group.POST("/games/create", s.CreateGame)
	group.GET("/games/:id", s.GetGameById)
	group.DELETE("/games/delete/:id", s.DeleteGame)
	group.POST("/games/update/:id", s.UpdateGame)
	group.POST("/games/finish/:id/:userId", s.FinishGame)
	group.GET("/games/active/user/:userId", s.GetActiveGamesByUserId)
	group.GET("/games/finished/user/:userId", s.GetFinishedGamesByUserId)
	group.POST("/games/remove-user", s.RemoveUserFromGame)
	group.POST("/games/add-user", s.AddUserToGame)
	group.GET("/games/invites/user/:userId", s.GetGameInvitesByUserId)
	group.POST("/games/invites/accept", s.AcceptGameInvite)
	group.POST("/games/invites/decline", s.DeclineGameInvite)

}

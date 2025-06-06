package api

import (
	"mindwarp/logger"
	"mindwarp/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) GetAllGameTemplates(c *gin.Context) {
	games, err := s.Db.GetAllGameTemplates(c.Request.Context())
	clientGames := make([]types.GameTemplateClient, len(games))
	if err != nil {
		logger.Errorf("Failed to get games: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_GAME_TEMPLATES_ERROR, Message: err.Error()})
	}

	for i, game := range games {
		clientGames[i] = types.GameTemplateClient{
			ID:          game.ID,
			Name:        game.Name,
			Description: game.Description,
			IsPublic:    game.IsPublic,
		}
	}

	c.JSON(http.StatusOK, clientGames)
}

func (s *Server) GetPublicGameTemplates(c *gin.Context) {
	games, err := s.Db.GetPublicGameTemplates(c.Request.Context())
	if err != nil {
		logger.Errorf("Failed to get public games: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_PUBLIC_GAME_TEMPLATES_ERROR, Message: err.Error()})
	}

	clientGames := make([]types.GameTemplateClient, len(games))
	for i, game := range games {
		clientGames[i] = types.GameTemplateClient{
			ID:          game.ID,
			Name:        game.Name,
			Description: game.Description,
			IsPublic:    game.IsPublic,
		}
	}

	c.JSON(http.StatusOK, clientGames)
}

func (s *Server) GetGameTemplateByID(c *gin.Context) {
	gameID := c.Param("id")
	game, err := s.Db.GetGameTemplateByID(c.Request.Context(), gameID)
	if err != nil {
		logger.Errorf("Failed to get game: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_GAME_TEMPLATE_BY_ID_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) GetGameTemplatesByCreatorID(c *gin.Context) {
	userID := c.Param("id")
	game, err := s.Db.GetGameTemplatesByCreatorID(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get game: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_GAME_TEMPLATES_BY_CREATOR_ID_ERROR, Message: err.Error()})
	}

	clientGames := make([]types.GameTemplateClient, len(game))
	for i, game := range game {
		clientGames[i] = types.GameTemplateClient{
			ID:          game.ID,
			Name:        game.Name,
			Description: game.Description,
			IsPublic:    game.IsPublic,
		}
	}

	c.JSON(http.StatusOK, clientGames)
}

func (s *Server) SearchGameTemplates(c *gin.Context) {
	query := c.Query("query")
	games, err := s.Db.SearchGameTemplates(c.Request.Context(), query)
	if err != nil {
		logger.Errorf("Failed to search games: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_SEARCH_GAME_TEMPLATES_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, games)
}

func (s *Server) CreateGameTemplate(c *gin.Context) {
	var gameBody types.GameTemplateClient
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		logger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{Code: INVALID_REQUEST_BODY, Message: err.Error()})
		return
	}
	gameTemplate, rounds, themes, questions, err := MapGameTemplateClientToDb(gameBody)

	if err != nil {
		logger.Errorf("Failed to map game client to db: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_MAP_GAME_TEMPLATE_CLIENT_TO_DB_ERROR, Message: err.Error()})
		return
	}

	err = s.Db.CreateCompleteGameTemplate(c.Request.Context(), gameTemplate, rounds, themes, questions)
	if err != nil {
		logger.Errorf("Failed to create game template: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_CREATE_GAME_TEMPLATE_ERROR, Message: err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Game template created successfully"})
}

func (s *Server) GetGameTemplateInfo(c *gin.Context) {
	gameID := c.Param("id")
	game, err := s.Db.GetFullGameTemplateById(c.Request.Context(), gameID)
	if err != nil {
		logger.Errorf("Failed to get game template info: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_GAME_TEMPLATE_INFO_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, game)
}

func (s *Server) UpdateGameTemplate(c *gin.Context) {
	var gameBody types.GameTemplateClient
	if err := c.ShouldBindJSON(&gameBody); err != nil {
		logger.Errorf("Failed to bind JSON: %v", err)
		c.JSON(http.StatusBadRequest, ErrorResponse{Code: INVALID_REQUEST_BODY, Message: err.Error()})
		return
	}

	gameTemplate, rounds, themes, questions, err := MapGameTemplateClientToDb(gameBody)

	if err != nil {
		logger.Errorf("Failed to map game client to db: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_MAP_GAME_TEMPLATE_CLIENT_TO_DB_ERROR, Message: err.Error()})
		return
	}

	err = s.Db.UpdateGameTemplate(c.Request.Context(), gameTemplate, rounds, themes, questions)
	if err != nil {
		logger.Errorf("Failed to update game template: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_UPDATE_GAME_TEMPLATE_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, gin.H{"message": "Game template updated successfully"})
}

func (s *Server) DeleteGameTemplate(c *gin.Context) {
	gameID := c.Param("id")
	err := s.Db.DeleteGameTemplate(c.Request.Context(), gameID)
	if err != nil {
		logger.Errorf("Failed to delete game template: %v", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_DELETE_GAME_TEMPLATE_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, gin.H{"message": "Game template deleted successfully"})
}

func (s *Server) AddGameTemplateRoutes(group *gin.RouterGroup) {
	group.GET("/game_templates", s.GetAllGameTemplates)
	group.GET("/game_templates/public", s.GetPublicGameTemplates)
	group.GET("/game_templates/search", s.SearchGameTemplates)
	group.GET("/game_templates/:id", s.GetGameTemplateByID)
	group.GET("/game_templates/user/:id", s.GetGameTemplatesByCreatorID)
	group.GET("/game_templates/info/:id", s.GetGameTemplateInfo)
	group.POST("/game_templates/create_template", s.CreateGameTemplate)
	group.POST("/game_templates/update", s.UpdateGameTemplate)
	group.DELETE("/game_templates/:id", s.DeleteGameTemplate)
}

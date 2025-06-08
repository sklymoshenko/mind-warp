package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) GetMyGamesCount(c *gin.Context) {
	userId := c.Query("userId")

	if userId == "" {
		c.JSON(http.StatusBadRequest, ErrorResponse{Code: FAIL_GET_COUNTS_ERROR, Message: "userId is required"})
		return
	}

	gamesCount, err := s.Db.ActiveGamesCount(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_COUNTS_ERROR, Message: err.Error()})
		return
	}

	templatesCount, err := s.Db.UserCreatedTemplatesCount(c.Request.Context(), userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_COUNTS_ERROR, Message: err.Error()})
		return
	}

	historyGamesCount, err := s.Db.UserFinishedGamesCount(c.Request.Context(), userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_COUNTS_ERROR, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"gamesCount": gamesCount, "templatesCount": templatesCount, "historyGamesCount": historyGamesCount})
}

func (s *Server) PublicTemplatesCount(c *gin.Context) {
	count, err := s.Db.PublicTemplatesCount(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_COUNTS_ERROR, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

func (s *Server) AddCountRoutes(group *gin.RouterGroup) {
	group.GET("/my-games/count", s.GetMyGamesCount)
	group.GET("/public-templates/count", s.PublicTemplatesCount)
}

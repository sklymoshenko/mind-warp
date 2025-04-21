package api

import (
	"mindwarp/logger"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) GetCurrentUser(c *gin.Context) {
	userID, ok := c.Get("currentUserID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No user ID"})
		return
	}
	logger.Debugf("User ID type: %T, value: %v", userID, userID)

	user, err := s.Db.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) GetUserByID(c *gin.Context, id string) {
	user, err := s.Db.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
	}
	c.JSON(http.StatusOK, user)
}

func (s *Server) GetAllUsers(c *gin.Context) {
	users, err := s.Db.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) AddUserRoutes(group *gin.RouterGroup) {
	group.GET("/me", s.GetCurrentUser)
	group.GET("/users", s.GetAllUsers)
}

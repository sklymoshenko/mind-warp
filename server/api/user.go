package api

import (
	"mindwarp/logger"
	"mindwarp/types"
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user: " + err.Error()})
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) GetUserByID(c *gin.Context, id string) {
	user, err := s.Db.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user: " + err.Error()})
	}
	c.JSON(http.StatusOK, user)
}

func (s *Server) GetAllUsers(c *gin.Context) {
	var users []types.UserServer
	var err error
	search := c.Query("search")
	if search != "" {
		users, err = s.Db.GetUserBySearch(search)
	} else {
		users, err = s.Db.GetAllUsers()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users: " + err.Error()})
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) GetUserBySearch(c *gin.Context) {
	search := c.Query("search")
	users, err := s.Db.GetUserBySearch(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users: " + err.Error()})
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) AddUserRoutes(group *gin.RouterGroup) {
	group.GET("/me", s.GetCurrentUser)
	group.GET("/users", s.GetAllUsers)
}

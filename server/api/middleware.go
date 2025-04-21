package api

import (
	"mindwarp/logger"

	"github.com/gin-gonic/gin"
)

func (s *Server) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken, err := c.Cookie("access_token")
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: No access token"})
			return
		}

		userID, err := s.AuthService().ValidateToken(accessToken)
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: Invalid access token"})
			return
		}

		logger.Debugf("User ID: %s", userID)
		c.Set("currentUserID", userID)
		c.Next()
	}
}

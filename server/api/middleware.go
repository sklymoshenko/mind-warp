package api

import (
	"github.com/gin-gonic/gin"
)

func (s *Server) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken, err := c.Cookie("access_token")
		if err != nil {
			c.AbortWithStatusJSON(401, ErrorResponse{Code: MISSING_ACCESS_TOKEN_ERROR, Message: "Unauthorized: No access token"})
			return
		}

		userID, err := s.AuthService().ValidateToken(accessToken)
		if err != nil {
			c.AbortWithStatusJSON(401, ErrorResponse{Code: INVALID_ACCESS_TOKEN_ERROR, Message: "Unauthorized: Invalid access token"})
			return
		}

		c.Set("currentUserID", userID)
		c.Next()
	}
}

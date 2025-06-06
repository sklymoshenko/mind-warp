package api

import (
	"mindwarp/types"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AddUserToGameRequest struct {
	GameID string `json:"gameID"`
	UserID string `json:"userID"`
}

func (s *Server) GetCurrentUser(c *gin.Context) {
	userID, ok := c.Get("currentUserID")
	if !ok {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Code: MISSING_ACCESS_TOKEN_ERROR, Message: "Unauthorized: No user ID"})
		return
	}

	user, err := s.Db.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_CURRENT_USER_ERROR, Message: err.Error()})
	}

	c.JSON(http.StatusOK, user)
}

func (s *Server) GetUserByID(c *gin.Context, id string) {
	user, err := s.Db.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_USER_BY_ID_ERROR, Message: err.Error()})
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
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_USERS_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) GetUserBySearch(c *gin.Context) {
	search := c.Query("search")
	users, err := s.Db.GetUserBySearch(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GET_USERS_SEARCH_ERROR, Message: err.Error()})
	}
	c.JSON(http.StatusOK, users)
}

func (s *Server) AddUserToGame(c *gin.Context) {
	var reqBody AddUserToGameRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{Code: INVALID_REQUEST_BODY, Message: err.Error()})
		return
	}

	err := s.Db.AddUserToGame(c.Request.Context(), reqBody.GameID, reqBody.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_ADD_USER_TO_GAME_ERROR, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User added to game"})
}

func (s *Server) AddUserRoutes(group *gin.RouterGroup) {
	group.GET("/me", s.GetCurrentUser)
	group.GET("/users", s.GetAllUsers)
}

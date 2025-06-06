package api

import (
	"mindwarp/logger"
	"mindwarp/types"
	"net/http"
	"os"
	"time"

	"github.com/alexedwards/argon2id"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type registerRequest struct {
	Username string `json:"username" binding:"required,min=2,max=32"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func validateRequest(c *gin.Context, err error) (ErrorResponse, error) {
	// collect all validator errors
	verrs, ok := err.(validator.ValidationErrors)
	if !ok {
		return ErrorResponse{Code: INVALID_REQUEST_BODY, Message: err.Error()}, err
	}

	out := ErrorResponse{}
	for _, fe := range verrs {
		if fe.Tag() == "min" && fe.Field() == "Password" {
			out.Code = VALIDATION_PASSWORD_TOO_SHORT
			out.Message = "Password must be at least 8 characters long"
		}

		if fe.Tag() == "max" && fe.Field() == "Username" {
			out.Code = VALIDATION_USERNAME_TOO_LONG
			out.Message = "Username must be less than 32 characters long"
		}

		if fe.Tag() == "min" && fe.Field() == "Username" {
			out.Code = VALIDATION_USERNAME_TOO_SHORT
			out.Message = "Username must be at least 2 characters long"
		}

		if fe.Tag() == "email" && fe.Field() == "Email" {
			out.Code = VALIDATION_INVALID_EMAIL
			out.Message = "Invalid email address"
		}
	}

	return out, nil
}

func parseLoginError(err error) ErrorResponse {
	if err.Error() == "no rows in result set" {
		return ErrorResponse{
			Code:    USER_LOGIN_NOT_FOUND_ERROR,
			Message: "User not found",
		}
	}

	return ErrorResponse{
		Code:    "UNKNOWN_ERROR",
		Message: err.Error(),
	}
}

func (s *Server) handleLogin(c *gin.Context, req loginRequest) {
	user, err := s.Db.GetUserByEmail(req.Email)
	if err != nil {
		response := parseLoginError(err)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	match, err := argon2id.ComparePasswordAndHash(req.Password, user.Password)

	if err != nil || !match {
		response := ErrorResponse{
			Code:    FAIL_PASSWORD_COMPARE_ERROR,
			Message: err.Error(),
		}

		if !match {
			response = ErrorResponse{
				Code:    INVALID_PASSWORD_ERROR,
				Message: "Invalid login or password",
			}
		}

		c.JSON(http.StatusUnauthorized, response)
		return
	}

	accessTokenTTL, err := time.ParseDuration(os.Getenv("ACCESS_TOKEN_TTL"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_ACCESS_TOKEN_PARSE_ERROR, Message: err.Error()})
		return
	}

	refreshTokenTTL, err := time.ParseDuration(os.Getenv("REFRESH_TOKEN_TTL"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_REFRESH_TOKEN_PARSE_ERROR, Message: err.Error()})
		return
	}

	accessToken, refreshToken, err := s.AuthService().GenerateTokens(user.ID, accessTokenTTL, refreshTokenTTL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_GENERATE_TOKENS_ERROR, Message: err.Error()})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)

	c.SetCookie(
		"access_token",
		accessToken,
		int(accessTokenTTL.Seconds()),
		"/",
		"",   // domain, empty for same domain
		true, // secure
		true, // httpOnly
	)

	c.SetCookie(
		"refresh_token",
		refreshToken,
		int(refreshTokenTTL.Seconds()),
		"/auth/refresh",
		"",   // domain
		true, // secure
		true, // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func (s *Server) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		out, err := validateRequest(c, err)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{Code: INVALID_REQUEST_BODY, Message: err.Error()})
			return
		}

		c.JSON(http.StatusBadRequest, out)
		return
	}

	s.handleLogin(c, req)
}

func (s *Server) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		out, err := validateRequest(c, err)
		if err != nil {
			c.JSON(http.StatusBadRequest, ErrorResponse{Code: INVALID_REQUEST_BODY, Message: err.Error()})
			return
		}

		c.JSON(http.StatusBadRequest, out)
		return
	}

	hashedPassword, err := argon2id.CreateHash(req.Password, argon2id.DefaultParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: FAIL_HASH_PASSWORD_ERROR, Message: err.Error()})
		return
	}

	user := types.UserServer{
		Name:     req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	err = s.Db.CreateUser(user)
	if err != nil {
		response := ParseSqlError(err)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	logger.Infof("User created successfully. Logging in... %s %s", user.Email, user.Name)
	s.handleLogin(c, loginRequest{Email: user.Email, Password: req.Password})
}

func (s *Server) Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (s *Server) Refresh(c *gin.Context) {}

func (s *Server) AddAuthRoutes(group *gin.RouterGroup) {
	group.POST("/auth/login", s.Login)
	group.POST("/auth/register", s.Register)
	group.GET("/auth/logout", s.Logout)
	group.POST("/auth/refresh", s.Refresh)
}

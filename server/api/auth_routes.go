package api

import (
	"mindwarp/db"
	"mindwarp/logger"
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

type FieldError struct {
	Field string `json:"field"`
	Tag   string `json:"tag"`
	Param string `json:"param,omitempty"`
}

type ValidationErrorResponse struct {
	ValidationErrors []FieldError `json:"validationErrors"`
}

func validateRequest(c *gin.Context, err error) (ValidationErrorResponse, error) {
	// collect all validator errors
	verrs, ok := err.(validator.ValidationErrors)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return ValidationErrorResponse{}, err
	}

	out := ValidationErrorResponse{}
	for _, fe := range verrs {
		out.ValidationErrors = append(out.ValidationErrors, FieldError{
			Field: fe.Field(), // e.g. “Email”
			Tag:   fe.Tag(),   // e.g. “email” or “min”
			Param: fe.Param(), // e.g. “8” for min=8
		})
	}

	return out, nil
}

func (s *Server) handleLogin(c *gin.Context, req loginRequest) {
	user, err := s.Db.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Error while getting user: " + err.Error()})
		return
	}

	match, err := argon2id.ComparePasswordAndHash(req.Password, user.Password)

	if err != nil || !match {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid login or password: " + err.Error()})
		return
	}

	accessTokenTTL, err := time.ParseDuration(os.Getenv("ACCESS_TOKEN_TTL"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse access token TTL"})
		return
	}

	refreshTokenTTL, err := time.ParseDuration(os.Getenv("REFRESH_TOKEN_TTL"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse refresh token TTL"})
		return
	}

	accessToken, refreshToken, err := s.AuthService().GenerateTokens(user.ID, accessTokenTTL, refreshTokenTTL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	s.handleLogin(c, req)
}

func (s *Server) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		out, err := validateRequest(c, err)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to validate request" + err.Error()})
			return
		}

		c.JSON(http.StatusBadRequest, out)
		return
	}

	hashedPassword, err := argon2id.CreateHash(req.Password, argon2id.DefaultParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := &db.User{
		Name:     req.Username,
		Email:    req.Email,
		Password: hashedPassword,
	}

	err = s.Db.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user:" + err.Error()})
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
	group.POST("/auth/logout", s.Logout)
	group.POST("/auth/refresh", s.Refresh)
}

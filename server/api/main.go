package api

import (
	"mindwarp/db"

	"github.com/gin-gonic/gin"
)

type Server struct {
	port        string
	router      *gin.Engine
	Db          *db.DB
	authService *AuthService
}

func NewServer() *Server {
	return &Server{
		port:        ":8080",
		router:      gin.Default(),
		authService: NewAuthService(),
		Db:          db.CreateDB(),
	}
}

func (s *Server) Start() {
	// Public routes (no auth required)
	public := s.router.Group("/")
	s.AddAuthRoutes(public)

	// Protected routes (require auth)
	protected := s.router.Group("/")
	protected.Use(s.AuthMiddleware())
	s.AddUserRoutes(protected)
	s.AddGameTemplateRoutes(protected)
	s.AddGameRoutes(protected)

	// s.FillDb()

	s.router.Run(s.port)
}

func (s *Server) AuthService() *AuthService {
	return s.authService
}

package api

import (
	"github.com/gin-gonic/gin"
)

type Server struct {
	port   string
	router *gin.Engine
}

func NewServer() *Server {
	return &Server{
		port:   ":8080",
		router: gin.Default(),
	}
}

func (s *Server) Start() {
	// Hello world route
	s.router.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Hello, World!"})
	})

	// Run server on port 8080
	s.router.Run(s.port)
}

package api

import (
	"context"
	"fmt"
	"mindwarp/db"
	"mindwarp/logger"
	"mindwarp/types"
)

func (s *Server) CreateGameTemplateDirectly(gameBody types.GameTemplateClient) error {
	gameTemplate, rounds, themes, questions, err := MapGameTemplateClientToDb(gameBody)
	if err != nil {
		logger.Errorf("Failed to map game client to db: %v", err)
		return fmt.Errorf("failed to map game client to db: %w", err)
	}

	err = s.Db.CreateCompleteGameTemplate(context.Background(), gameTemplate, rounds, themes, questions)
	if err != nil {
		logger.Errorf("Failed to create game template: %v", err)
		return fmt.Errorf("failed to create game template: %w", err)
	}

	return nil
}

func (s *Server) FillDb() {
	users, err := s.Db.GetAllUsers()
	if err != nil {
		logger.Errorf("Failed to get users: %v", err)
		return
	}

	for _, game := range db.Generate30GameTemplates(users[0].ID) {
		if err := s.CreateGameTemplateDirectly(game); err != nil {
			logger.Errorf("Failed to create game template: %v", err)
			continue
		}
	}
}

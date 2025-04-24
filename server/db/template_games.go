package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func scanGameTemplate(rows pgx.Rows) ([]GameTemplate, error) {
	games := []GameTemplate{}
	for rows.Next() {
		var game GameTemplate
		err := rows.Scan(&game.ID, &game.Name, &game.Description)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}
	return games, nil
}

func (db *DB) GetAllGames() ([]GameTemplate, error) {
	rows, err := db.conn.Query(context.Background(), "SELECT id, name, description FROM game_templates")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	games, err := scanGameTemplate(rows)
	if err != nil {
		return nil, err
	}

	return games, nil
}

func (db *DB) GetGameByID(id string) (*GameTemplate, error) {
	row := db.conn.QueryRow(context.Background(), "SELECT id, name, description FROM game_templates WHERE id = $1", id)

	var game GameTemplate
	err := row.Scan(&game.ID, &game.Name, &game.Description)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

func (db *DB) GetGameByUserID(userID string) ([]GameTemplate, error) {
	rows, err := db.conn.Query(context.Background(), "SELECT id, name, description FROM game_templates WHERE creator_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	games, err := scanGameTemplate(rows)
	if err != nil {
		return nil, err
	}
	return games, nil
}

func (db *DB) SearchGames(query string) ([]GameTemplate, error) {
	rows, err := db.conn.Query(context.Background(), "SELECT id, name, description FROM game_templates WHERE name ILIKE $1", "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	games, err := scanGameTemplate(rows)
	if err != nil {
		return nil, err
	}
	return games, nil
}

func (db *DB) CreateGameTemplate(ctx context.Context, gameTemplate GameTemplate) error {
	_, err := db.conn.Exec(ctx, "INSERT INTO game_templates (id, name, description, creator_id, is_public) VALUES ($1, $2, $3, $4, $5)", gameTemplate.ID, gameTemplate.Name, gameTemplate.Description, gameTemplate.CreatorID, gameTemplate.IsPublic)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateRound(ctx context.Context, round TemplateRound) error {
	_, err := db.conn.Exec(ctx, "INSERT INTO template_rounds (id, game_template_id, name, time_settings, rank_settings, position) VALUES ($1, $2, $3, $4, $5, $6)", round.ID, round.GameTemplateID, round.Name, round.TimeSettings, round.RankSettings, round.Position)
	if err != nil {
		return err
	}
	return nil
}

// CreateCompleteGameTemplate creates a complete game template with selective batch processing
func (db *DB) CreateCompleteGameTemplate(ctx context.Context, template GameTemplate, rounds []TemplateRound, themes map[string][]TemplateTheme, questions map[string][]TemplateQuestion) error {
	tx, err := db.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Insert template (single insert)
	if err := db.CreateGameTemplate(ctx, template); err != nil {
		return fmt.Errorf("failed to insert game template: %w", err)
	}

	// 2. Insert rounds (sequential inserts)
	for i, round := range rounds {
		if err := db.CreateRound(ctx, round); err != nil {
			return fmt.Errorf("failed to insert round %d: %w", i+1, err)
		}
	}

	// 3. Batch insert themes and questions
	batch := &pgx.Batch{}

	// Track operation counts for error handling
	opCounts := struct {
		themes    int
		questions int
	}{}

	// Queue themes
	for roundID, roundThemes := range themes {
		for _, theme := range roundThemes {
			// Validate theme belongs to the correct round
			if theme.RoundID != roundID {
				return fmt.Errorf("theme %s has incorrect round ID: expected %s, got %s", theme.ID, roundID, theme.RoundID)
			}

			batch.Queue(
				`INSERT INTO template_themes 
				(id, round_id, name, position) 
				VALUES ($1, $2, $3, $4)`,
				theme.ID,
				theme.RoundID,
				theme.Name,
				theme.Position,
			)
			opCounts.themes++
		}
	}

	// Queue questions
	for themeID, themeQuestions := range questions {
		for _, question := range themeQuestions {
			// Validate question belongs to the correct theme
			if question.ThemeID != themeID {
				return fmt.Errorf("question %s has incorrect theme ID: expected %s, got %s", question.ID, themeID, question.ThemeID)
			}

			batch.Queue(
				`INSERT INTO template_questions 
				(id, theme_id, text, answer, points, position) 
				VALUES ($1, $2, $3, $4, $5, $6)`,
				question.ID,
				question.ThemeID,
				question.Text,
				question.Answer,
				question.Points,
				question.Position,
			)
			opCounts.questions++
		}
	}

	// Execute the batch if we have any operations
	if batch.Len() > 0 {
		batchResults := tx.SendBatch(ctx, batch)
		defer batchResults.Close()

		// Process themes results
		for i := 0; i < opCounts.themes; i++ {
			if _, err := batchResults.Exec(); err != nil {
				return fmt.Errorf("failed to insert theme %d: %w", i+1, err)
			}
		}

		// Process questions results
		for i := 0; i < opCounts.questions; i++ {
			if _, err := batchResults.Exec(); err != nil {
				return fmt.Errorf("failed to insert question %d: %w", i+1, err)
			}
		}
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

package db

import (
	"context"
	"encoding/json"
	"fmt"

	"mindwarp/logger"
	"mindwarp/types"

	"github.com/jackc/pgx/pgtype"
	"github.com/jackc/pgx/v5"
)

var (
	gameID          pgtype.UUID
	gameName        pgtype.Text
	gameDescription pgtype.Text
	gameIsPublic    pgtype.Bool

	roundID       pgtype.UUID
	roundName     pgtype.Text
	roundTimeJSON []byte // Scan JSONB as []byte
	roundRankJSON []byte // Scan JSONB as []byte
	roundPosition pgtype.Int4

	themeID       pgtype.UUID
	themeName     pgtype.Text
	themePosition pgtype.Int4

	questionID       pgtype.UUID
	questionText     pgtype.Text
	questionAnswer   pgtype.Text
	questionPoints   pgtype.Int4
	questionPosition pgtype.Int4
)

func scanGameTemplate(rows pgx.Rows) ([]types.GameTemplateServer, error) {
	games := []types.GameTemplateServer{}
	for rows.Next() {
		var game types.GameTemplateServer
		err := rows.Scan(&game.ID, &game.Name, &game.Description)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}
	return games, nil
}

func (db *DB) GetAllGames(ctx context.Context) ([]types.GameTemplateServer, error) {
	rows, err := db.conn.Query(ctx, "SELECT id, name, description FROM game_templates")
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

func (db *DB) GetGameByID(ctx context.Context, id string) (*types.GameTemplateServer, error) {
	row := db.conn.QueryRow(ctx, "SELECT id, name, description FROM game_templates WHERE id = $1", id)

	var game types.GameTemplateServer
	err := row.Scan(&game.ID, &game.Name, &game.Description)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

func (db *DB) GetGameByUserID(ctx context.Context, userID string) ([]types.GameTemplateServer, error) {
	rows, err := db.conn.Query(ctx, "SELECT id, name, description FROM game_templates WHERE creator_id = $1", userID)
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

func (db *DB) SearchGames(ctx context.Context, query string) ([]types.GameTemplateServer, error) {
	rows, err := db.conn.Query(ctx, "SELECT id, name, description FROM game_templates WHERE name ILIKE $1", "%"+query+"%")
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

func (db *DB) GetFullGame(ctx context.Context, id string) (*types.GameTemplateClient, error) {
	query := `
		SELECT
			gt.id, gt.name, gt.description, gt.is_public,
			tr.id, tr.name, tr.time_settings, tr.rank_settings, tr.position,
			tt.id, tt.name, tt.position,
			tq.id, tq.text, tq.answer, tq.points, tq.position
		FROM
			game_templates gt
		LEFT JOIN
			template_rounds tr ON gt.id = tr.game_template_id
		LEFT JOIN
			template_themes tt ON tr.id = tt.round_id
		LEFT JOIN
			template_questions tq ON tt.id = tq.theme_id
		WHERE
			gt.id = $1
		ORDER BY
			tr.position, tt.position, tq.position;
	`

	rows, err := db.conn.Query(ctx, query, id)
	if err != nil {
		// Consider checking for pgx.ErrNoRows if Query can return it for no matches
		return nil, fmt.Errorf("failed to query full game template: %w", err)
	}
	defer rows.Close()

	var gameTemplate *types.GameTemplateClient
	roundsMap := make(map[string]*types.RoundClient)
	themesMap := make(map[string]*types.ThemeClient)

	for rows.Next() {
		err := rows.Scan(
			&gameID, &gameName, &gameDescription, &gameIsPublic,
			&roundID, &roundName, &roundTimeJSON, &roundRankJSON, &roundPosition,
			&themeID, &themeName, &themePosition,
			&questionID, &questionText, &questionAnswer, &questionPoints, &questionPosition,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game template row: %w", err)
		}

		gameIDStr := uuidToString(gameID)
		roundIDStr := uuidToString(roundID)
		themeIDStr := uuidToString(themeID)
		questionIDStr := uuidToString(questionID)

		// Initialize game template on the first valid row
		if gameTemplate == nil {
			if gameID.Status != pgtype.Present {
				continue
			}
			gameTemplate = &types.GameTemplateClient{
				Id:          gameIDStr,
				Name:        gameName.String,
				Description: gameDescription.String,
				IsPublic:    gameIsPublic.Bool,
				Rounds:      []types.RoundClient{}, // Initialize slice
			}
		}

		if roundID.Status == pgtype.Present {
			_, exists := roundsMap[roundIDStr]
			if exists {
				continue
			}

			var timeSetting types.RoundTimeClient
			if len(roundTimeJSON) > 0 && string(roundTimeJSON) != "null" {
				if err := json.Unmarshal(roundTimeJSON, &timeSetting); err != nil {
					logger.Errorf("Failed to unmarshal time settings for round %s: %v. Using default.", roundIDStr, err)
					timeSetting = types.RoundTimeClient{}
				}
			}

			var rankSetting []types.RoundRankClient
			if len(roundRankJSON) > 0 && string(roundRankJSON) != "null" {
				if err := json.Unmarshal(roundRankJSON, &rankSetting); err != nil {
					logger.Errorf("Failed to unmarshal rank settings for round %s: %v. Using default.", roundIDStr, err)
					rankSetting = []types.RoundRankClient{}
				}
			}

			round := &types.RoundClient{
				Id:     roundIDStr,
				Name:   roundName.String,
				Time:   timeSetting,
				Ranks:  rankSetting,
				Themes: []types.ThemeClient{},
			}
			roundsMap[roundIDStr] = round
			gameTemplate.Rounds = append(gameTemplate.Rounds, *round)

			if themeID.Status == pgtype.Present {
				_, exists := themesMap[themeIDStr]
				if exists {
					continue
				}
				theme := &types.ThemeClient{
					Id:        themeIDStr,
					Name:      themeName.String,
					Questions: []types.QuestionClient{},
				}
				themesMap[themeIDStr] = theme
				round.Themes = append(round.Themes, *theme)

				if questionID.Status == pgtype.Present {
					question := types.QuestionClient{
						Id:     questionIDStr,
						Text:   questionText.String,
						Answer: questionAnswer.String,
						Points: int(questionPoints.Int),
					}

					theme.Questions = append(theme.Questions, question)
				}
			}
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating game template rows: %w", err)
	}

	if gameTemplate == nil {
		return nil, fmt.Errorf("game template with id %s not found", id)
	}

	return gameTemplate, nil

}

func (db *DB) CreateGameTemplate(ctx context.Context, gameTemplate types.GameTemplateServer) error {
	logger.Infof("Creating game template: %v", gameTemplate)
	_, err := db.conn.Exec(ctx, "INSERT INTO game_templates (id, name, description, creator_id, is_public) VALUES ($1, $2, $3, $4, $5)", gameTemplate.ID, gameTemplate.Name, gameTemplate.Description, gameTemplate.CreatorID, gameTemplate.IsPublic)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) CreateRound(ctx context.Context, round types.TemplateRoundServer) error {
	_, err := db.conn.Exec(ctx, "INSERT INTO template_rounds (id, game_template_id, name, time_settings, rank_settings, position) VALUES ($1, $2, $3, $4, $5, $6)", round.ID, round.GameTemplateID, round.Name, round.TimeSettings, round.RankSettings, round.Position)
	if err != nil {
		return err
	}
	return nil
}

// CreateCompleteGameTemplate creates a complete game template with selective batch processing
func (db *DB) CreateCompleteGameTemplate(ctx context.Context, template types.GameTemplateServer, rounds []types.TemplateRoundServer, themes map[string][]types.TemplateThemeServer, questions map[string][]types.TemplateQuestionServer) error {
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

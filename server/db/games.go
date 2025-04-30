package db

import (
	"context"
	"encoding/json"
	"fmt"
	"mindwarp/logger"
	"mindwarp/types"
	"sort"

	"github.com/jackc/pgx/pgtype"
	"github.com/jackc/pgx/v5"
)

func insertGame(ctx context.Context, tx pgx.Tx, game types.GameServer) error {
	_, err := tx.Exec(ctx, "INSERT INTO games (id, name, creator_id, template_id) VALUES ($1, $2, $3, $4)", game.ID, game.Name, game.CreatorID, game.TemplateID)
	if err != nil {
		return err
	}
	return nil
}

func insertGameRound(ctx context.Context, tx pgx.Tx, round types.RoundServer) error {
	_, err := tx.Exec(ctx, "INSERT INTO rounds (id, game_id, name, time_settings, rank_settings, position) VALUES ($1, $2, $3, $4, $5, $6)", round.ID, round.GameID, round.Name, round.TimeSettings, round.RankSettings, round.Position)
	if err != nil {
		return err
	}
	return nil
}

func (db *DB) GetUsersByGameId(ctx context.Context, id string) ([]types.UserClient, error) {
	query := `
		SELECT
			u.id, u.name, u.is_admin
		FROM
			game_users gu
		LEFT JOIN
			users u ON gu.user_id = u.id
		WHERE
			gu.game_id = $1
	`
	rows, err := db.pool.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by game id: %w", err)
	}
	defer rows.Close()

	var users []types.UserClient
	for rows.Next() {
		var user types.UserClient
		err := rows.Scan(&user.ID, &user.Name, &user.IsAdmin)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	return users, nil
}

func (db *DB) CreateGame(ctx context.Context, game types.GameServer, rounds []types.RoundServer, themes map[string][]types.ThemeServer, questions map[string][]types.QuestionServer, users []types.UserServer) error {
	tx, err := db.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Insert template (single insert)
	if err := insertGame(ctx, tx, game); err != nil {
		return fmt.Errorf("failed to insert game: %w", err)
	}

	// 2. Insert rounds (sequential inserts)
	for i, round := range rounds {
		if err := insertGameRound(ctx, tx, round); err != nil {
			return fmt.Errorf("failed to insert round %d: %w", i+1, err)
		}
	}

	// 3. Batch insert themes and questions
	batch := &pgx.Batch{}

	// Track operation counts for error handling
	opCounts := struct {
		themes    int
		questions int
		users     int
	}{}

	// Queue themes
	for roundID, roundThemes := range themes {
		for _, theme := range roundThemes {
			// Validate theme belongs to the correct round
			if theme.RoundID != roundID {
				return fmt.Errorf("theme %s has incorrect round ID: expected %s, got %s", theme.ID, roundID, theme.RoundID)
			}

			batch.Queue(
				`INSERT INTO themes 
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
				`INSERT INTO questions 
				(id, theme_id, text, answer, points) 
				VALUES ($1, $2, $3, $4, $5)`,
				question.ID,
				question.ThemeID,
				question.Text,
				question.Answer,
				question.Points,
			)
			opCounts.questions++
		}
	}

	// Queue users
	for _, user := range users {
		batch.Queue(
			`INSERT INTO game_users (game_id, user_id) VALUES ($1, $2)`,
			game.ID,
			user.ID,
		)
		opCounts.users++
	}

	// Execute the batch if we have any operations
	if batch.Len() > 0 {
		batchResults := tx.SendBatch(ctx, batch)

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

		// Process users results
		for i := 0; i < opCounts.users; i++ {
			if _, err := batchResults.Exec(); err != nil {
				return fmt.Errorf("failed to insert user %d: %w", i+1, err)
			}
		}

		if err := batchResults.Close(); err != nil {
			return fmt.Errorf("failed to close batch: %w", err)
		}
	}

	// Commit the transaction
	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (db *DB) GetGameById(ctx context.Context, id string) (*types.GameClient, error) {
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

		questionID     pgtype.UUID
		questionText   pgtype.Text
		questionAnswer pgtype.Text
		questionPoints pgtype.Int4
	)

	query := `
		SELECT
			gt.id, gt.name, gt.description, gt.is_public,
			tr.id, tr.name, tr.time_settings, tr.rank_settings, tr.position,
			tt.id, tt.name, tt.position,
			tq.id, tq.text, tq.answer, tq.points,
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
			tr.position, tt.position, tq.points;
	`

	rows, err := db.pool.Query(ctx, query, id)
	if err != nil {
		// Consider checking for pgx.ErrNoRows if Query can return it for no matches
		return nil, fmt.Errorf("failed to query full game template: %w", err)
	}
	defer rows.Close()

	var game *types.GameClient
	roundsMap := make(map[string]*types.RoundServer)
	themesMap := make(map[string]*types.ThemeServer)
	questionsMap := make(map[string]*types.QuestionServer)
	count := 0
	for rows.Next() {
		count++
		err := rows.Scan(
			&gameID, &gameName, &gameDescription, &gameIsPublic,
			&roundID, &roundName, &roundTimeJSON, &roundRankJSON, &roundPosition,
			&themeID, &themeName, &themePosition,
			&questionID, &questionText, &questionAnswer, &questionPoints,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game template row: %w", err)
		}

		gameIDStr := uuidToString(gameID)
		roundIDStr := uuidToString(roundID)
		themeIDStr := uuidToString(themeID)
		questionIDStr := uuidToString(questionID)

		// Initialize game template on the first valid row
		if game == nil {
			if gameID.Status != pgtype.Present {
				continue
			}
			game = &types.GameClient{
				ID:          gameIDStr,
				Name:        gameName.String,
				Description: gameDescription.String,
				Rounds:      []types.RoundClient{}, // Initialize slice
			}
		}

		if roundID.Status == pgtype.Present {
			var timeSetting types.TimeSettings
			if len(roundTimeJSON) > 0 && string(roundTimeJSON) != "null" {
				if err := json.Unmarshal(roundTimeJSON, &timeSetting); err != nil {
					logger.Errorf("Failed to unmarshal time settings for round %s: %v. Using default.", roundIDStr, err)
					timeSetting = types.TimeSettings{}
				}
			}

			var rankSetting []types.RankSettings
			if len(roundRankJSON) > 0 && string(roundRankJSON) != "null" {
				if err := json.Unmarshal(roundRankJSON, &rankSetting); err != nil {
					logger.Errorf("Failed to unmarshal rank settings for round %s: %v. Using default.", roundIDStr, err)
					rankSetting = []types.RankSettings{}
				}
			}

			round := &types.RoundServer{
				ID:           roundIDStr,
				Name:         roundName.String,
				TimeSettings: timeSetting,
				RankSettings: rankSetting,
			}
			roundsMap[roundIDStr] = round

			if themeID.Status == pgtype.Present {
				theme := &types.ThemeServer{
					ID:       themeIDStr,
					Name:     themeName.String,
					RoundID:  roundIDStr,
					Position: int(themePosition.Int),
				}
				themesMap[themeIDStr] = theme

				if questionID.Status == pgtype.Present {
					_, exists := questionsMap[questionIDStr]
					if exists {
						fmt.Println("question already exists", questionIDStr)
						continue
					}
					question := &types.QuestionServer{
						ID:      questionIDStr,
						ThemeID: themeIDStr,
						Text:    questionText.String,
						Answer:  questionAnswer.String,
						Points:  int(questionPoints.Int),
					}

					questionsMap[questionIDStr] = question
				}
			}
		}
	}

	// Convert maps to slices and organize the data
	for _, round := range roundsMap {
		// Get themes for this round
		var roundThemes []types.ThemeClient

		for _, theme := range themesMap {
			if theme.RoundID == round.ID {
				// Get questions for this theme
				var themeQuestions []types.QuestionClient
				for _, question := range questionsMap {
					if question.ThemeID == theme.ID {
						themeQuestions = append(themeQuestions, types.QuestionClient{
							Id:     question.ID,
							Text:   question.Text,
							Answer: question.Answer,
							Points: question.Points,
						})
					}
				}

				sort.Slice(themeQuestions, func(i, j int) bool {
					return themeQuestions[i].Points < themeQuestions[j].Points
				})

				roundThemes = append(roundThemes, types.ThemeClient{
					Id:        theme.ID,
					Name:      theme.Name,
					Questions: themeQuestions,
				})

				sort.Slice(roundThemes, func(i, j int) bool {
					positionA := themesMap[roundThemes[i].Id].Position
					positionB := themesMap[roundThemes[j].Id].Position
					return positionA < positionB
				})
			}
		}

		// Convert rank settings to client format
		var roundRanks []types.RoundRankClient
		for i, rank := range round.RankSettings {
			roundRanks = append(roundRanks, types.RoundRankClient{
				Id:         uint16(i + 1),
				Label:      rank.Label,
				IsSelected: rank.IsSelected,
			})
		}

		// Convert time settings to client format
		timeClient := types.RoundTimeClient{
			Id:         uint16(round.TimeSettings.ID),
			Label:      round.TimeSettings.Label,
			IsSelected: round.TimeSettings.IsSelected,
		}

		// Create round client
		roundClient := types.RoundClient{
			Id:     round.ID,
			Name:   round.Name,
			Ranks:  roundRanks,
			Time:   timeClient,
			Themes: roundThemes,
		}

		game.Rounds = append(game.Rounds, roundClient)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating game template rows: %w", err)
	}

	if game == nil {
		return nil, fmt.Errorf("game template with id %s not found", id)
	}

	users, err := db.GetUsersByGameId(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by game id: %w", err)
	}
	game.Users = users

	return game, nil
}

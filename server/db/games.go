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

func getGameByFilter(filterType string, offset string, limit string, query string) string {
	baseQuery := `
		WITH ordered_games AS (
			SELECT g.*
			FROM games g
			ORDER BY g.created_at DESC NULLS LAST
			OFFSET %s
			LIMIT %s
		)
		SELECT
			g.id, g.name, g.is_finished, g.creator_id, g.template_id,
			g.current_round_id, g.current_question_id, g.current_user_id,
			g.finish_date,
			w.id as winner_id, w.name as winner_name, g.created_at,
			r.id, r.name, r.time_settings, r.rank_settings, r.position,
			t.id, t.name, t.position,
			q.id, q.text, q.answer, q.points
		FROM
			ordered_games g
		LEFT JOIN
			users w ON g.winner_id = w.id
		%s
		ORDER BY
			g.created_at DESC NULLS LAST, r.position, t.position, q.points;
	`

	filters := `
	LEFT JOIN
		rounds r ON g.id = r.game_id
	LEFT JOIN
		themes t ON r.id = t.round_id
	LEFT JOIN
		questions q ON t.id = q.theme_id
	WHERE
		g.id = $1
	`

	switch filterType {
	case "creator_id":
		filters = `
		LEFT JOIN
			rounds r ON g.id = r.game_id
		LEFT JOIN
			themes t ON r.id = t.round_id
		LEFT JOIN
			questions q ON t.id = q.theme_id
		WHERE
			g.creator_id = $1
		`
	case "user":
		filters = `
		INNER JOIN
			game_users gu ON gu.game_id = g.id AND gu.user_id = $1
		LEFT JOIN
			rounds r ON g.id = r.game_id
		LEFT JOIN
			themes t ON r.id = t.round_id
		LEFT JOIN
			questions q ON t.id = q.theme_id
		WHERE
			g.is_finished = false
		`
	case "user_finished":
		filters = `
		INNER JOIN
			game_users gu ON gu.game_id = g.id AND gu.user_id = $1
		LEFT JOIN
			rounds r ON g.id = r.game_id
		LEFT JOIN
			themes t ON r.id = t.round_id
		LEFT JOIN
			questions q ON t.id = q.theme_id
		WHERE
			g.is_finished = true
		`
	case "public_unfinished":
		filters = `
		LEFT JOIN
			rounds r ON g.id = r.game_id
		LEFT JOIN
			themes t ON r.id = t.round_id
		LEFT JOIN
			questions q ON t.id = q.theme_id
		WHERE
			g.is_public = true AND g.is_finished = false
		`
	case "public_finished":
		filters = `
		LEFT JOIN
			rounds r ON g.id = r.game_id
		LEFT JOIN
			themes t ON r.id = t.round_id
		LEFT JOIN
			questions q ON t.id = q.theme_id
		WHERE
			g.is_public = true AND g.is_finished = true
		`
	case "all":
		filters = "1=1"
	default:
	}

	if offset == "" {
		offset = "0"
	}
	if limit == "" {
		limit = "25"
	}

	if query != "" {
		search := "%" + query + "%"
		filters += fmt.Sprintf(" AND g.name ILIKE '%s'", search)
	}

	return fmt.Sprintf(baseQuery, offset, limit, filters)
}

func (db *DB) GetUsersByGameId(ctx context.Context, id string) ([]types.GameUserClient, error) {
	query := `
		SELECT
			u.id, u.name, u.is_admin, gu.round_scores
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

	var users []types.GameUserClient
	for rows.Next() {
		var user types.GameUserClient
		err := rows.Scan(&user.ID, &user.Name, &user.IsAdmin, &user.RoundScore)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}

		users = append(users, user)
	}
	return users, nil
}

func (db *DB) CreateGame(ctx context.Context, game types.GameServer, rounds []types.RoundServer, themes map[string][]types.ThemeServer, questions map[string][]types.QuestionServer, users []types.UserServer, answers []types.AnswerServer) error {
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
		answers   int
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
			`INSERT INTO game_invites (game_id, user_id, status) VALUES ($1, $2, CASE WHEN $3 = $4 THEN 'accepted'::invite_status ELSE 'pending'::invite_status END)`,
			game.ID,
			user.ID,
			user.ID,
			game.CreatorID,
		)

		if user.ID == game.CreatorID {
			batch.Queue(
				`INSERT INTO game_users (game_id, user_id) VALUES ($1, $2)`,
				game.ID,
				user.ID,
			)
			opCounts.users++
		}

		opCounts.users++
	}

	// Queue answers
	for _, answer := range answers {
		batch.Queue(
			`INSERT INTO answers (question_id, user_id, is_correct, time_answered) VALUES ($1, $2, $3, $4)`,
			answer.QuestionID,
			answer.UserID,
			answer.IsCorrect,
			answer.TimeAnswered,
		)
		opCounts.answers++
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

func (db *DB) GetAnswersByQuestionIds(ctx context.Context, questionIds []string) (map[string]map[string]types.AnsweredByClient, error) {
	if len(questionIds) == 0 {
		return make(map[string]map[string]types.AnsweredByClient), nil
	}

	query := `
		SELECT
			question_id,
			user_id,
			is_correct,
			time_answered
		FROM
			answers
		WHERE
			question_id = ANY($1)
	`

	rows, err := db.pool.Query(ctx, query, questionIds)
	if err != nil {
		return nil, fmt.Errorf("failed to query answers: %w", err)
	}
	defer rows.Close()

	answers := make(map[string]map[string]types.AnsweredByClient)
	for rows.Next() {
		var (
			questionID   string
			userID       string
			isCorrect    bool
			timeAnswered uint16
		)

		err := rows.Scan(&questionID, &userID, &isCorrect, &timeAnswered)
		if err != nil {
			return nil, fmt.Errorf("failed to scan answer: %w", err)
		}

		if _, exists := answers[questionID]; !exists {
			answers[questionID] = make(map[string]types.AnsweredByClient)
		}

		answers[questionID][userID] = types.AnsweredByClient{
			IsCorrect:    isCorrect,
			TimeAnswered: timeAnswered,
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating answers rows: %w", err)
	}

	return answers, nil
}

func (db *DB) GetGameByFilter(ctx context.Context, filter string, filterValue string, offset string, limit string, query string) ([]*types.GameClient, error) {
	var (
		gameID                pgtype.UUID
		gameName              pgtype.Text
		gameCreatorID         pgtype.UUID
		gameTemplateID        pgtype.UUID
		gameIsFinished        pgtype.Bool
		gameCurrentRoundID    pgtype.UUID
		gameCurrentQuestionID pgtype.UUID
		gameCurrentUserID     pgtype.UUID
		gameFinishDate        pgtype.Timestamp
		gameWinnerName        pgtype.Text
		gameWinnerID          pgtype.UUID
		gameCreatedAt         pgtype.Timestamp

		roundID       pgtype.UUID
		roundName     pgtype.Text
		roundTimeJSON []byte
		roundRankJSON []byte
		roundPosition pgtype.Int4

		themeID       pgtype.UUID
		themeName     pgtype.Text
		themePosition pgtype.Int4

		questionID     pgtype.UUID
		questionText   pgtype.Text
		questionAnswer pgtype.Text
		questionPoints pgtype.Int4
	)
	pgQuery := getGameByFilter(filter, offset, limit, query)

	rows, err := db.pool.Query(ctx, pgQuery, filterValue)
	if err != nil {
		return nil, fmt.Errorf("failed to query full game template: %w", err)
	}
	defer rows.Close()

	gamesMap := make(map[string]bool)
	roundsMap := make(map[string]map[string]*types.RoundServer)
	themesMap := make(map[string]map[string]*types.ThemeServer)
	questionsMap := make(map[string]map[string]*types.QuestionServer)
	questionIds := make([]string, 0)

	// Process each game
	var games []*types.GameClient
	// Use a slice to maintain the order from SQL query
	orderedGames := make([]*types.GameClient, 0, len(gamesMap))

	for rows.Next() {
		err := rows.Scan(
			&gameID, &gameName, &gameIsFinished, &gameCreatorID, &gameTemplateID,
			&gameCurrentRoundID, &gameCurrentQuestionID, &gameCurrentUserID,
			&gameFinishDate, &gameWinnerID, &gameWinnerName, &gameCreatedAt,
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

		if _, exists := gamesMap[gameIDStr]; !exists {
			if gameID.Status != pgtype.Present {
				continue
			}
			game := &types.GameClient{
				ID:              gameIDStr,
				Name:            gameName.String,
				IsFinished:      gameIsFinished.Bool,
				CurrentRound:    uuidToString(gameCurrentRoundID),
				CurrentQuestion: uuidToString(gameCurrentQuestionID),
				CurrentUser:     uuidToString(gameCurrentUserID),
				Winner: types.UserClient{
					ID:   uuidToString(gameWinnerID),
					Name: gameWinnerName.String,
				},
				Rounds:     []types.RoundClient{},
				CreatorID:  uuidToString(gameCreatorID),
				TemplateID: uuidToString(gameTemplateID),
				CreatedAt:  gameCreatedAt.Time.UnixMilli(),
			}

			if gameFinishDate.Status == pgtype.Present {
				game.FinishDate = gameFinishDate.Time.UnixMilli()
			}

			gamesMap[gameIDStr] = true
			orderedGames = append(orderedGames, game)
			roundsMap[gameIDStr] = make(map[string]*types.RoundServer)
			themesMap[gameIDStr] = make(map[string]*types.ThemeServer)
			questionsMap[gameIDStr] = make(map[string]*types.QuestionServer)
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
			roundsMap[gameIDStr][roundIDStr] = round

			if themeID.Status == pgtype.Present {
				theme := &types.ThemeServer{
					ID:       themeIDStr,
					Name:     themeName.String,
					RoundID:  roundIDStr,
					Position: uint16(themePosition.Int),
				}
				themesMap[gameIDStr][themeIDStr] = theme

				if questionID.Status == pgtype.Present {
					_, exists := questionsMap[gameIDStr][questionIDStr]
					if exists {
						continue
					}
					question := &types.QuestionServer{
						ID:      questionIDStr,
						ThemeID: themeIDStr,
						Text:    questionText.String,
						Answer:  questionAnswer.String,
						Points:  uint16(questionPoints.Int),
					}
					questionsMap[gameIDStr][questionIDStr] = question
					questionIds = append(questionIds, questionIDStr)
				}
			}
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating game template rows: %w", err)
	}

	if len(gamesMap) == 0 {
		return []*types.GameClient{}, nil
	}

	// Get all answers for the questions
	answers, err := db.GetAnswersByQuestionIds(ctx, questionIds)
	if err != nil {
		return nil, fmt.Errorf("failed to get answers: %w", err)
	}

	// Process each game in the original order
	for _, game := range orderedGames {
		gameID := game.ID
		for _, round := range roundsMap[gameID] {
			var roundThemes []types.ThemeClient

			for _, theme := range themesMap[gameID] {
				if theme.RoundID == round.ID {
					var themeQuestions []types.QuestionClient
					for _, question := range questionsMap[gameID] {
						if question.ThemeID == theme.ID {
							questionClient := types.QuestionClient{
								Id:         question.ID,
								Text:       question.Text,
								Answer:     question.Answer,
								Points:     question.Points,
								AnsweredBy: make(map[string]types.AnsweredByClient),
							}

							if answers[question.ID] != nil {
								questionClient.AnsweredBy = answers[question.ID]
							}

							themeQuestions = append(themeQuestions, questionClient)

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

				}
			}

			sort.Slice(roundThemes, func(i, j int) bool {
				positionA := themesMap[gameID][roundThemes[i].Id].Position
				positionB := themesMap[gameID][roundThemes[j].Id].Position
				return positionA < positionB
			})

			var roundRanks []types.RoundRankClient
			for i, rank := range round.RankSettings {
				roundRanks = append(roundRanks, types.RoundRankClient{
					Id:         uint16(i + 1),
					Label:      rank.Label,
					IsSelected: rank.IsSelected,
				})
			}

			timeClient := types.RoundTimeClient{
				Id:         uint16(round.TimeSettings.ID),
				Label:      round.TimeSettings.Label,
				IsSelected: round.TimeSettings.IsSelected,
			}

			roundClient := types.RoundClient{
				Id:     round.ID,
				Name:   round.Name,
				Ranks:  roundRanks,
				Time:   timeClient,
				Themes: roundThemes,
			}

			game.Rounds = append(game.Rounds, roundClient)
		}

		users, err := db.GetUsersByGameId(ctx, game.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get users by game id: %w", err)
		}
		game.Users = users

		games = append(games, game)
	}

	return games, nil
}

func (db *DB) GetGameInvitesByUserId(ctx context.Context, userID string) ([]types.GameInviteClient, error) {
	query := `
		SELECT
			gi.id, gi.game_id, gi.user_id, gi.status, gi.created_at, gi.updated_at,
			g.name as game_name, u.name as game_creator_name
		FROM
			game_invites gi
		JOIN games g ON g.id = gi.game_id
		JOIN users u ON u.id = g.creator_id
		WHERE
			gi.user_id = $1 AND gi.status = 'pending'
		ORDER BY gi.created_at DESC
	`

	rows, err := db.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query game invites by user id: %w", err)
	}
	defer rows.Close()

	var gameInvites []types.GameInviteClient
	for rows.Next() {
		var gameInvite types.GameInviteClient
		err := rows.Scan(&gameInvite.ID, &gameInvite.GameID, &gameInvite.UserID, &gameInvite.Status, &gameInvite.CreatedAt, &gameInvite.UpdatedAt, &gameInvite.GameName, &gameInvite.GameCreatorName)
		if err != nil {
			return nil, fmt.Errorf("failed to scan game invite: %w", err)
		}
		gameInvites = append(gameInvites, gameInvite)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating game invites rows: %w", err)
	}

	return gameInvites, nil
}

func (db *DB) GetPendingGameUsersByGameId(ctx context.Context, gameID string) ([]types.UnconfirmedUserClient, error) {
	query := `
		SELECT
			u.id, u.name
		FROM
			game_invites gi
		JOIN users u ON u.id = gi.user_id
		WHERE
			gi.game_id = $1 AND gi.status = 'pending'
	`

	rows, err := db.pool.Query(ctx, query, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to query pending game users by game id: %w", err)
	}
	defer rows.Close()

	var pendingGameUsers []types.UnconfirmedUserClient
	for rows.Next() {
		var pendingGameUser types.UnconfirmedUserClient
		err := rows.Scan(&pendingGameUser.ID, &pendingGameUser.Name)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pending game user: %w", err)
		}
		pendingGameUsers = append(pendingGameUsers, pendingGameUser)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending game users rows: %w", err)
	}

	return pendingGameUsers, nil
}

func (db *DB) RemoveUserFromGame(ctx context.Context, gameID string, userID string) error {
	_, err := db.pool.Exec(ctx, "DELETE FROM game_users WHERE game_id = $1 AND user_id = $2", gameID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove user from game: %w", err)
	}
	return nil
}

func (db *DB) AddUserToGame(ctx context.Context, gameID string, userID string) error {
	_, err := db.pool.Exec(ctx, "INSERT INTO game_users (game_id, user_id) VALUES ($1, $2)", gameID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove user from game: %w", err)
	}
	return nil
}

func (db *DB) SendGameInvite(ctx context.Context, gameID string, userID string) error {
	_, err := db.pool.Exec(ctx, "INSERT INTO game_invites (game_id, user_id) VALUES ($1, $2)", gameID, userID)
	if err != nil {
		return fmt.Errorf("failed to send game invite: %w", err)
	}
	return nil
}

func (db *DB) AcceptGameInvite(ctx context.Context, inviteID string, gameID string, userID string) error {
	_, err := db.pool.Exec(ctx, "UPDATE game_invites SET status = 'accepted' WHERE id = $1", inviteID)
	if err != nil {
		return fmt.Errorf("failed to accept game invite: %w", err)
	}

	err = db.AddUserToGame(ctx, gameID, userID)
	if err != nil {
		return fmt.Errorf("failed to add user to game: %w", err)
	}

	return nil
}

func (db *DB) GetUnconfirmedUsersByGameId(ctx context.Context, gameID string) ([]types.UnconfirmedUserClient, error) {
	query := `
		SELECT
			u.id, u.name, gi.status
		FROM
			game_invites gi
		JOIN users u ON u.id = gi.user_id
		WHERE
			gi.game_id = $1 AND gi.status != 'accepted'
	`

	rows, err := db.pool.Query(ctx, query, gameID)
	if err != nil {
		return nil, fmt.Errorf("failed to query pending users by game id: %w", err)
	}
	defer rows.Close()

	var unconfirmedUsers []types.UnconfirmedUserClient
	for rows.Next() {
		var pendingUser types.UnconfirmedUserClient
		err := rows.Scan(&pendingUser.ID, &pendingUser.Name, &pendingUser.Status)
		if err != nil {
			return nil, fmt.Errorf("failed to scan pending user: %w", err)
		}
		unconfirmedUsers = append(unconfirmedUsers, pendingUser)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating pending users rows: %w", err)
	}

	return unconfirmedUsers, nil
}

func (db *DB) DeclineGameInvite(ctx context.Context, inviteID string) error {
	_, err := db.pool.Exec(ctx, "UPDATE game_invites SET status = 'declined' WHERE id = $1", inviteID)
	if err != nil {
		return fmt.Errorf("failed to decline game invite: %w", err)
	}
	return nil
}

func (db *DB) DeleteGame(ctx context.Context, gameID string) error {
	_, err := db.pool.Exec(ctx, "DELETE FROM games WHERE id = $1", gameID)
	if err != nil {
		return fmt.Errorf("failed to delete game: %w", err)
	}
	return nil
}

func (db *DB) UpdateGameAndGameUsers(ctx context.Context, game types.GameServer, users []types.GameUserServer, answers []types.AnswerServer) error {
	tx, err := db.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	currentRoundID := interface{}(nil)
	if game.CurrentRoundID != "" {
		currentRoundID = game.CurrentRoundID
	}

	currentQuestionID := interface{}(nil)
	if game.CurrentQuestionID != "" {
		currentQuestionID = game.CurrentQuestionID
	}

	currentUserID := interface{}(nil)
	if game.CurrentUserID != "" {
		currentUserID = game.CurrentUserID
	}

	_, err = tx.Exec(ctx, "UPDATE games SET name = $1, current_round_id = $2, current_question_id = $3, current_user_id = $4 WHERE id = $5", game.Name, currentRoundID, currentQuestionID, currentUserID, game.ID)
	if err != nil {
		return fmt.Errorf("failed to update game: %w", err)
	}

	for _, user := range users {
		_, err = tx.Exec(ctx, "UPDATE game_users SET round_scores = $1 WHERE game_id = $2 AND user_id = $3", user.RoundScore, game.ID, user.UserID)
		if err != nil {
			return fmt.Errorf("failed to update game user: %w", err)
		}
	}

	for _, answer := range answers {
		_, err = tx.Exec(ctx, `
			INSERT INTO answers (question_id, user_id, is_correct, time_answered) 
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (question_id, user_id) 
			DO UPDATE SET 
				is_correct = EXCLUDED.is_correct,
				time_answered = EXCLUDED.time_answered
		`, answer.QuestionID, answer.UserID, answer.IsCorrect, answer.TimeAnswered)
		if err != nil {
			return fmt.Errorf("failed to upsert answer: %w", err)
		}
	}

	err = tx.Commit(ctx)
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (db *DB) FinishGame(ctx context.Context, gameID string, winningUserID string) error {
	logger.Info("Finishing game", "gameID", gameID, "winningUserID", winningUserID)
	_, err := db.pool.Exec(ctx, "UPDATE games SET is_finished = true, winner_id = $1, finish_date = NOW() WHERE id = $2", winningUserID, gameID)
	if err != nil {
		return fmt.Errorf("failed to finish game: %w", err)
	}
	return nil
}

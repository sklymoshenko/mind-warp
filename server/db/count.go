package db

import (
	"context"
)

func (db *DB) ActiveGamesCount(ctx context.Context, userId string) (int, error) {
	query := `SELECT COUNT(*) FROM game_users gu JOIN games g ON gu.game_id = g.id WHERE gu.user_id = $1 AND g.is_finished = false`
	row := db.pool.QueryRow(ctx, query, userId)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (db *DB) UserCreatedTemplatesCount(ctx context.Context, userId string) (int, error) {
	query := `SELECT COUNT(*) FROM game_templates WHERE creator_id = $1`
	row := db.pool.QueryRow(ctx, query, userId)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (db *DB) UserFinishedGamesCount(ctx context.Context, userId string) (int, error) {
	query := `SELECT COUNT(*) FROM game_users gu JOIN games g ON gu.game_id = g.id WHERE gu.user_id = $1 AND g.is_finished = true`
	row := db.pool.QueryRow(ctx, query, userId)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (db *DB) PublicTemplatesCount(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM game_templates WHERE is_public = true`
	row := db.pool.QueryRow(ctx, query)

	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

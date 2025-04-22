package db

import (
	"context"

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
	rows, err := db.conn.Query(context.Background(), "SELECT id, name, description FROM game_templates WHERE user_id = $1", userID)
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

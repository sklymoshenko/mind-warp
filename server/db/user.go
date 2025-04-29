package db

import (
	"context"

	"mindwarp/types"
)

func (db *DB) GetUserByEmail(email string) (types.UserServer, error) {
	var user types.UserServer
	err := db.pool.QueryRow(context.Background(), "SELECT id, email, password_hash FROM users WHERE email = $1", email).Scan(&user.ID, &user.Email, &user.Password)
	if err != nil {
		return types.UserServer{}, err
	}
	return user, nil
}

func (db *DB) GetUserByID(id string) (types.UserServer, error) {
	var user types.UserServer
	err := db.pool.QueryRow(context.Background(), "SELECT id, email, name FROM users WHERE id = $1", id).Scan(&user.ID, &user.Email, &user.Name)
	if err != nil {
		return types.UserServer{}, err
	}
	return user, nil
}

func (db *DB) CreateUser(user types.UserServer) error {
	_, err := db.pool.Exec(context.Background(), "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)", user.Name, user.Email, user.Password)
	return err
}

func (db *DB) GetAllUsers() ([]types.UserServer, error) {
	rows, err := db.pool.Query(context.Background(), "SELECT id, name, email FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []types.UserServer{}
	for rows.Next() {
		var user types.UserServer
		err := rows.Scan(&user.ID, &user.Name, &user.Email)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (db *DB) GetUserBySearch(search string) ([]types.UserServer, error) {
	rows, err := db.pool.Query(context.Background(), "SELECT id, name, email FROM users WHERE name ILIKE $1", "%"+search+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []types.UserServer{}
	for rows.Next() {
		var user types.UserServer
		err := rows.Scan(&user.ID, &user.Name, &user.Email)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

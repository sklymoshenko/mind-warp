package db

import "context"

func (db *DB) GetUserByEmail(email string) (User, error) {
	var user User
	err := db.conn.QueryRow(context.Background(), "SELECT id, email, password_hash FROM users WHERE email = $1", email).Scan(&user.ID, &user.Email, &user.Password)
	if err != nil {
		return User{}, err
	}
	return user, nil
}

func (db *DB) GetUserByID(id string) (User, error) {
	var user User
	err := db.conn.QueryRow(context.Background(), "SELECT id, email, name FROM users WHERE id = $1", id).Scan(&user.ID, &user.Email, &user.Name)
	if err != nil {
		return User{}, err
	}
	return user, nil
}

func (db *DB) CreateUser(user User) error {
	_, err := db.conn.Exec(context.Background(), "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)", user.Name, user.Email, user.Password)
	return err
}

func (db *DB) GetAllUsers() ([]User, error) {
	rows, err := db.conn.Query(context.Background(), "SELECT id, name, email FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Name, &user.Email)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

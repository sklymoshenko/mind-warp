package db

import (
	_ "embed"
	"encoding/json"
	"mindwarp/logger"
	"mindwarp/types"

	"github.com/alexedwards/argon2id"
)

//go:embed users.json
var usersBytes []byte

var users []types.UserServer

func init() {
	err := json.Unmarshal(usersBytes, &users)
	if err != nil {
		logger.Error("Failed to unmarshal users: " + err.Error())
	}
}

func (db *DB) fillUsers() {
	for _, user := range users {

		hashedPassword, err := argon2id.CreateHash(user.Password, argon2id.DefaultParams)
		if err != nil {
			logger.Error("Failed to hash password: " + err.Error())
			continue
		}

		user := types.UserServer{
			Name:     user.Name,
			Email:    user.Email,
			Password: hashedPassword,
		}
		err = db.CreateUser(user)
		if err != nil {
			logger.Error("Failed to create user: " + err.Error())
		}
	}
}

package db

import (
	"context"
	"fmt"
	"mindwarp/logger"
	"os"

	"github.com/jackc/pgx/v5"
)

type DB struct {
	conn *pgx.Conn
}

func CreateDB() *DB {
	db := &DB{}
	db.Initialize()
	return db
}

func (db *DB) Initialize() {
	dbUrl := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_SSLMODE"),
	)

	conn, err := pgx.Connect(context.Background(), dbUrl)
	if err != nil {
		logger.Errorf("unable to connect: %s", err)
		os.Exit(1)
	}

	db.conn = conn
	logger.Info("Connected to database")
}

func (db *DB) Close() {
	db.conn.Close(context.Background())
}

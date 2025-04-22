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
	// logger.Info("Connected to database %s", conn.Config().ConnString())
	// tables, err := db.GetTables()
	// if err != nil {
	// 	logger.Errorf("Error getting tables: %v", err)
	// 	return
	// }

	// logger.Info("Tables in the database: %v", tables)
}

func (db *DB) Close() {
	db.conn.Close(context.Background())
}

func (db *DB) GetTables() ([]string, error) {
	tables := make([]string, 0)
	rows, err := db.conn.Query(context.Background(), `
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = 'public'
		ORDER BY table_name;
	`)
	if err != nil {
		logger.Errorf("Error querying table names: %v", err)
		return nil, err
	}
	defer rows.Close()

	logger.Info("Tables in the database:")
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			logger.Errorf("Error scanning table name: %v", err)
			continue
		}
		tables = append(tables, tableName)
	}

	if err := rows.Err(); err != nil {
		logger.Errorf("Error iterating over table names: %v", err)
	}

	return tables, nil
}

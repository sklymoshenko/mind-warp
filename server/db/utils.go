package db

import (
	"context"
	"fmt"
	"mindwarp/logger"

	"github.com/jackc/pgx/pgtype"
)

func uuidToString(u pgtype.UUID) string {
	if u.Status != pgtype.Present {
		return ""
	}

	var buf [16]byte = u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", buf[0:4], buf[4:6], buf[6:8], buf[8:10], buf[10:16])
}

// CountQuery efficiently counts rows in a table using PostgreSQL's statistics
// This is much faster than COUNT(*) for large tables
func (db *DB) CountQuery(ctx context.Context, tableName string) (int64, error) {
	var count int64

	// First try to get an estimate from statistics
	err := db.pool.QueryRow(ctx, `
		SELECT reltuples::bigint AS estimate
		FROM pg_class
		WHERE relname = $1
	`, tableName).Scan(&count)

	if err != nil {
		logger.Errorf("Error getting count estimate: %v", err)
		// Fallback to exact count if statistics are not available
		err = db.pool.QueryRow(ctx, "SELECT COUNT(*) FROM "+tableName).Scan(&count)
		if err != nil {
			return 0, err
		}
	}

	return count, nil
}

// GetPaginatedData is a helper function to get paginated data with total count
func (db *DB) GetPaginatedData(ctx context.Context, tableName string, page, limit int) (interface{}, int64, error) {
	offset := (page - 1) * limit

	// Get total count using the efficient method
	total, err := db.CountQuery(ctx, tableName)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated data
	rows, err := db.pool.Query(ctx, `
		SELECT *
		FROM `+tableName+`
		ORDER BY id
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	// Process rows and return data
	// Note: You'll need to implement the specific row scanning logic
	// based on your table structure
	return nil, total, nil
}

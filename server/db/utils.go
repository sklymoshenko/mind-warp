package db

import (
	"fmt"

	"github.com/jackc/pgx/pgtype"
)

func uuidToString(u pgtype.UUID) string {
	if u.Status != pgtype.Present {
		return ""
	}

	var buf [16]byte = u.Bytes
	return fmt.Sprintf("%x-%x-%x-%x-%x", buf[0:4], buf[4:6], buf[6:8], buf[8:10], buf[10:16])
}

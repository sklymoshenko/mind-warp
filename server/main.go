package main

import (
	"mindwarp/api"
	"mindwarp/db"
	"os"

	"github.com/joho/godotenv"
)

func init() {
	godotenv.Load(".env")

	if os.Getenv("GO_ENV") == "development" {
		godotenv.Overload(".env.development")
	}
}

func main() {
	db := db.CreateDB()
	server := api.NewServer()
	server.Start()

	defer db.Close()
}

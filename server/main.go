package main

import (
	"mindwarp/api"
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
	server := api.NewServer()
	server.Start()

	defer server.Db.Close()
}

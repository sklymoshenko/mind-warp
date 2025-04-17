# Simple Makefile for Go project

BINARY=mindwarp
BIN_DIR=bin

.PHONY: all build-dev build-prod run-dev run-prod test clean

all: build-dev

# build with development environment
build-dev:
	mkdir -p $(BIN_DIR)
	GO_ENV=development go build -o $(BIN_DIR)/$(BINARY) .

# build with production environment
build-prod:
	mkdir -p $(BIN_DIR)
	GO_ENV=production go build -o $(BIN_DIR)/$(BINARY) .



#--------------------------------
# Docker Compose targets
#--------------------------------

# Start development environment (uses .env.development)
dev-up:
	@echo "Starting development environment..."
	 docker compose -f docker-compose.dev.yml  --env-file .env.development up -d


# Stop development environment
dev-down:
	docker compose -f docker-compose.dev.yml --env-file .env.development down


# Start production environment (uses .env)
prod-up:
	@echo "Starting production environment..."
	 docker compose -f docker-compose.yml --env-file .env up -d


# Stop production environment
prod-down:
	docker compose -f docker-compose.yml --env-file .env down


#--------------------------------
# Run targets
#--------------------------------
run-dev: build-dev
	@echo "Running development environment..."
	@export GO_ENV=development && \
	 ./$(BIN_DIR)/$(BINARY)

test:
	go test ./...

clean:
	rm -f $(BIN_DIR)/$(BINARY)

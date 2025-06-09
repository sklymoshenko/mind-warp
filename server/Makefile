# Simple Makefile for Go project

BINARY=mindwarp
BIN_DIR=bin

.PHONY: all build-dev build-prod run-dev run-prod test clean mdown mup test-dev test-prod

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
	make kill-port-5432
# Kill processes listening on port 5432 (useful if docker-compose down fails to release the port)
kill-port-5432:
	@echo "Attempting to kill processes listening on port 5432..."
	@PIDS=$$(lsof -ti :5432); \
	if [ -n "$$PIDS" ]; then \
		echo "Found PIDs on port 5432: $$PIDS. Terminating..."; \
		kill -9 $$PIDS || echo "Could not kill all processes, or no processes were found."; \
	else \
		echo "No processes found listening on port 5432."; \
	fi


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


#--------------------------------
# Migration targets
#--------------------------------

mdown:
	@echo "Loading environment variables from .env.development"
	@bash -c 'set -a; . .env.development; set +a; \
	echo "PostgreSQL URL: postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE"; \
	echo "Migrating down..."; \
	goose -dir migrations postgres "postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE" down'

mup:
	@echo "Loading environment variables from .env.development"
	@bash -c 'set -a; . .env.development; set +a; \
	echo "PostgreSQL URL: postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE"; \
	echo "Migrating up..."; \
	goose -dir migrations postgres "postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE" up'


mdown-prod:
	@echo "Loading environment variables from .env"
	@bash -c 'set -a; . ../.env; set +a; \
	echo "PostgreSQL URL: postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE"; \
	echo "Migrating down..."; \
	goose -dir migrations postgres "postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE" down'

mup-prod:
	@echo "Loading environment variables from .env"
	@bash -c 'set -a; . ../.env; set +a; \
	echo "PostgreSQL URL: postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE"; \
	echo "Migrating up..."; \
	goose -dir migrations postgres "postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@localhost:$$POSTGRES_PORT/$$POSTGRES_DB?sslmode=$$POSTGRES_SSLMODE" up'



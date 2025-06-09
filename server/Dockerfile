# Build stage
FROM golang:1.24.4-alpine3.22 as builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN GIN_MODE=release CGO_ENABLED=0 GOOS=linux go build -o mindwarp .

# Production stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/mindwarp .

# Copy any additional files needed
COPY --from=builder /app/.env .

EXPOSE 8080

CMD ["./mindwarp"] 
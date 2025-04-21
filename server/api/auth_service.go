package api

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) GenerateTokens(userID string, accessTTL time.Duration, refreshTTL time.Duration) (string, string, error) {
	accessClaims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTTL)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	accessTokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)

	JWT_SECRET := os.Getenv("JWT_SECRET")
	if JWT_SECRET == "" {
		return "", "", errors.New("JWT_SECRET is not set")
	}

	accessToken, err := accessTokenClaims.SignedString([]byte(JWT_SECRET))
	if err != nil {
		return "", "", err
	}

	refreshClaims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshTTL)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	refreshTokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	refreshToken, err := refreshTokenClaims.SignedString([]byte(JWT_SECRET))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (s *AuthService) ValidateToken(tokenString string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET is not set")
	}

	var claims jwt.RegisteredClaims

	token, err := jwt.ParseWithClaims(
		tokenString,
		&claims,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, jwt.ErrTokenUnverifiable
			}
			return []byte(secret), nil
		},
		jwt.WithLeeway(5*time.Second),
	)
	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", errors.New("invalid token")
	}

	if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(time.Now()) {
		return "", errors.New("token expired")
	}

	return claims.Subject, nil
}

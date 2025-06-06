package api

import (
	"mindwarp/types"
	"strings"
)

const (
	SQL_UNIQUE_VIOLATION                 = "23505"
	SQL_UNIQUE_VIOLATION_USERS_NAME_KEY  = "users_name_key"
	SQL_UNIQUE_VIOLATION_USERS_EMAIL_KEY = "users_email_key"
)

const (
	MISSING_ACCESS_TOKEN_ERROR = "MISSING_ACCESS_TOKEN"
	INVALID_ACCESS_TOKEN_ERROR = "INVALID_ACCESS_TOKEN"

	USER_NAME_ALREADY_EXISTS_ERROR  = "USER_NAME_ALREADY_EXISTS"
	USER_EMAIL_ALREADY_EXISTS_ERROR = "USER_EMAIL_ALREADY_EXISTS"
	INVALID_PASSWORD_ERROR          = "INVALID_PASSWORD"
	USER_LOGIN_NOT_FOUND_ERROR      = "USER_LOGIN_NOT_FOUND"
	FAIL_GET_CURRENT_USER_ERROR     = "FAIL_GET_CURRENT_USER_ERROR"
	FAIL_GET_USER_BY_ID_ERROR       = "FAIL_GET_USER_BY_ID_ERROR"
	FAIL_GET_USERS_ERROR            = "FAIL_GET_USERS_ERROR"
	FAIL_GET_USERS_SEARCH_ERROR     = "FAIL_GET_USERS_SEARCH_ERROR"
	FAIL_ADD_USER_TO_GAME_ERROR     = "FAIL_ADD_USER_TO_GAME_ERROR"

	FAIL_ACCESS_TOKEN_PARSE_ERROR  = "FAIL_ACCESS_TOKEN_PARSE_ERROR"
	FAIL_REFRESH_TOKEN_PARSE_ERROR = "FAIL_REFRESH_TOKEN_PARSE_ERROR"
	FAIL_GENERATE_TOKENS_ERROR     = "FAIL_GENERATE_TOKENS_ERROR"

	INVALID_REQUEST_BODY = "INVALID_REQUEST_BODY"

	FAIL_HASH_PASSWORD_ERROR    = "FAIL_HASH_PASSWORD_ERROR"
	FAIL_PASSWORD_COMPARE_ERROR = "FAIL_PASSWORD_COMPARE_ERROR"

	FAIL_MAP_GAME_TEMPLATE_CLIENT_TO_DB_ERROR   = "FAIL_MAP_GAME_TEMPLATE_CLIENT_TO_DB_ERROR"
	FAIL_CREATE_GAME_TEMPLATE_ERROR             = "FAIL_CREATE_GAME_TEMPLATE_ERROR"
	FAIL_GET_GAME_TEMPLATE_BY_ID_ERROR          = "FAIL_GET_GAME_TEMPLATE_BY_ID_ERROR"
	FAIL_GET_GAME_TEMPLATES_ERROR               = "FAIL_GET_GAME_TEMPLATES_ERROR"
	FAIL_GET_PUBLIC_GAME_TEMPLATES_ERROR        = "FAIL_GET_PUBLIC_GAME_TEMPLATES_ERROR"
	FAIL_GET_GAME_TEMPLATES_BY_CREATOR_ID_ERROR = "FAIL_GET_GAME_TEMPLATES_BY_CREATOR_ID_ERROR"
	FAIL_GET_GAME_TEMPLATE_INFO_ERROR           = "FAIL_GET_GAME_TEMPLATE_INFO_ERROR"
	FAIL_SEARCH_GAME_TEMPLATES_ERROR            = "FAIL_SEARCH_GAME_TEMPLATES_ERROR"
	FAIL_UPDATE_GAME_TEMPLATE_ERROR             = "FAIL_UPDATE_GAME_TEMPLATE_ERROR"
	FAIL_DELETE_GAME_TEMPLATE_ERROR             = "FAIL_DELETE_GAME_TEMPLATE_ERROR"

	FAIL_MAP_GAME_CLIENT_TO_DB_ERROR        = "FAIL_MAP_GAME_CLIENT_TO_DB_ERROR"
	FAIL_CREATE_GAME_ERROR                  = "FAIL_CREATE_GAME_ERROR"
	FAIL_GET_GAME_BY_ID_ERROR               = "FAIL_GET_GAME_BY_ID_ERROR"
	FAIL_GET_PENDING_USERS_BY_GAME_ID_ERROR = "FAIL_GET_PENDING_USERS_BY_GAME_ID_ERROR"
	FAIL_GET_ACTIVE_GAMES_ERROR             = "FAIL_GET_ACTIVE_GAMES_ERROR"
	FAIL_GET_FINISHED_GAMES_ERROR           = "FAIL_GET_FINISHED_GAMES_ERROR"
	FAIL_REMOVE_USER_FROM_GAME_ERROR        = "FAIL_REMOVE_USER_FROM_GAME_ERROR"
	FAIL_GET_GAME_INVITES_ERROR             = "FAIL_GET_GAME_INVITES_ERROR"
	FAIL_ACCEPT_GAME_INVITE_ERROR           = "FAIL_ACCEPT_GAME_INVITE_ERROR"
	FAIL_DECLINE_GAME_INVITE_ERROR          = "FAIL_DECLINE_GAME_INVITE_ERROR"
	FAIL_DELETE_GAME_ERROR                  = "FAIL_DELETE_GAME_ERROR"
	FAIL_FINISH_GAME_ERROR                  = "FAIL_FINISH_GAME_ERROR"
	FAIL_UPDATE_GAME_ERROR                  = "FAIL_UPDATE_GAME_ERROR"

	VALIDATION_PASSWORD_TOO_SHORT = "VALIDATION_PASSWORD_TOO_SHORT"
	VALIDATION_USERNAME_TOO_LONG  = "VALIDATION_USERNAME_TOO_LONG"
	VALIDATION_USERNAME_TOO_SHORT = "VALIDATION_USERNAME_TOO_SHORT"
	VALIDATION_INVALID_EMAIL      = "VALIDATION_INVALID_EMAIL"
)

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message,omitempty"`
	Details any    `json:"details,omitempty"`
}

func ParseSqlError(err error) ErrorResponse {

	if strings.Contains(err.Error(), SQL_UNIQUE_VIOLATION) {
		if strings.Contains(err.Error(), "users_name_key") {
			return ErrorResponse{
				Code:    USER_NAME_ALREADY_EXISTS_ERROR,
				Message: "User with this name already exists",
			}
		}

		if strings.Contains(err.Error(), "users_email_key") {
			return ErrorResponse{
				Code:    USER_EMAIL_ALREADY_EXISTS_ERROR,
				Message: "User with this email already exists",
			}
		}
	}

	return ErrorResponse{
		Code:    "UNKNOWN_ERROR",
		Message: err.Error(),
	}
}

func MapGameTemplateClientToDb(body types.GameTemplateClient) (types.GameTemplateServer, []types.TemplateRoundServer, map[string][]types.TemplateThemeServer, map[string][]types.TemplateQuestionServer, error) {
	rounds := make([]types.TemplateRoundServer, len(body.Rounds))
	themes := make(map[string][]types.TemplateThemeServer)
	questions := make(map[string][]types.TemplateQuestionServer)

	for i, round := range body.Rounds {
		rankSettings := make([]types.RankSettings, len(round.Ranks))
		for j, rank := range round.Ranks {
			rankSettings[j] = types.RankSettings{
				ID:         rank.Id,
				Label:      rank.Label,
				IsSelected: rank.IsSelected,
			}
		}

		rounds[i] = types.TemplateRoundServer{
			ID:             round.Id,
			Name:           round.Name,
			GameTemplateID: body.ID,
			TimeSettings: types.TimeSettings{
				ID:         round.Time.Id,
				Label:      round.Time.Label,
				IsSelected: round.Time.IsSelected,
			},
			RankSettings: rankSettings,
		}

		for j, theme := range round.Themes {
			themes[round.Id] = append(themes[round.Id], types.TemplateThemeServer{
				ID:       theme.Id,
				RoundID:  round.Id,
				Name:     theme.Name,
				Position: uint16(j),
			})

			for j, question := range theme.Questions {
				questions[theme.Id] = append(questions[theme.Id], types.TemplateQuestionServer{
					ID:       question.Id,
					ThemeID:  theme.Id,
					Text:     question.Text,
					Answer:   question.Answer,
					Points:   question.Points,
					Position: uint16(j),
				})
			}
		}
	}

	return types.GameTemplateServer{
		ID:          body.ID,
		Name:        body.Name,
		Description: body.Description,
		IsPublic:    body.IsPublic,
		CreatorID:   body.CreatorID,
	}, rounds, themes, questions, nil
}

func MapGameClientToCreate(body types.GameClient) (types.GameServer, []types.RoundServer, map[string][]types.ThemeServer, map[string][]types.QuestionServer, []types.UserServer, []types.AnswerServer, error) {
	rounds := make([]types.RoundServer, len(body.Rounds))
	themes := make(map[string][]types.ThemeServer)
	questions := make(map[string][]types.QuestionServer)
	users := make([]types.UserServer, len(body.Users))
	answers := make([]types.AnswerServer, 0)

	for i, user := range body.Users {
		users[i] = types.UserServer{
			ID: user.ID,
		}
	}

	for i, round := range body.Rounds {
		rankSettings := make([]types.RankSettings, len(round.Ranks))
		for j, rank := range round.Ranks {
			rankSettings[j] = types.RankSettings{
				ID:         rank.Id,
				Label:      rank.Label,
				IsSelected: rank.IsSelected,
			}
		}

		rounds[i] = types.RoundServer{
			ID:     round.Id,
			Name:   round.Name,
			GameID: body.ID,
			TimeSettings: types.TimeSettings{
				ID:         round.Time.Id,
				Label:      round.Time.Label,
				IsSelected: round.Time.IsSelected,
			},
			RankSettings: rankSettings,
		}

		for j, theme := range round.Themes {
			themes[round.Id] = append(themes[round.Id], types.ThemeServer{
				ID:       theme.Id,
				RoundID:  round.Id,
				Name:     theme.Name,
				Position: uint16(j),
			})

			for _, question := range theme.Questions {
				questions[theme.Id] = append(questions[theme.Id], types.QuestionServer{
					ID:      question.Id,
					ThemeID: theme.Id,
					Text:    question.Text,
					Answer:  question.Answer,
					Points:  question.Points,
				})

				for userID, answeredBy := range question.AnsweredBy {
					answers = append(answers, types.AnswerServer{
						QuestionID:   question.Id,
						UserID:       userID,
						IsCorrect:    answeredBy.IsCorrect,
						TimeAnswered: answeredBy.TimeAnswered,
					})
				}
			}
		}
	}

	return types.GameServer{
		ID:         body.ID,
		Name:       body.Name,
		CreatorID:  body.CreatorID,
		TemplateID: body.TemplateID,
	}, rounds, themes, questions, users, answers, nil
}

func MapGameClientToUpdate(body types.GameClient) (types.GameServer, []types.GameUserServer, []types.AnswerServer, error) {
	answers := make([]types.AnswerServer, 0)

	game := types.GameServer{
		ID:                body.ID,
		Name:              body.Name,
		CreatorID:         body.CreatorID,
		TemplateID:        body.TemplateID,
		WinnerID:          body.Winner.ID,
		CurrentRoundID:    body.CurrentRound,
		CurrentQuestionID: body.CurrentQuestion,
		CurrentUserID:     body.CurrentUser,
	}

	users := make([]types.GameUserServer, len(body.Users))
	for i, user := range body.Users {
		users[i] = types.GameUserServer{
			GameID:     body.ID,
			UserID:     user.ID,
			RoundScore: user.RoundScore,
		}
	}

	for _, round := range body.Rounds {
		for _, theme := range round.Themes {
			for _, question := range theme.Questions {
				for userID, answeredBy := range question.AnsweredBy {
					answers = append(answers, types.AnswerServer{
						QuestionID:   question.Id,
						UserID:       userID,
						IsCorrect:    answeredBy.IsCorrect,
						TimeAnswered: answeredBy.TimeAnswered,
					})
				}
			}
		}
	}

	return game, users, answers, nil
}

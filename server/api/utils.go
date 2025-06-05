package api

import (
	"mindwarp/types"
)

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
			GameID:      body.ID,
			UserID:      user.ID,
			RoundScores: user.RoundScores,
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

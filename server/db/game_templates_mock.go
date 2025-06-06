package db

import (
	"mindwarp/types"

	"github.com/google/uuid"
)

func Generate30GameTemplates(creatorID string) []types.GameTemplateClient {
	var templates []types.GameTemplateClient

	timeOptions := []struct {
		Seconds uint16
		Label   string
	}{
		{30, "30 seconds"},
		{45, "45 seconds"},
		{60, "1 minute"},
	}

	rankOptions := []struct {
		Points uint16
		Label  string
	}{
		{100, "Easy"},
		{200, "Medium"},
		{300, "Hard"},
		{400, "Expert"},
		{500, "Master"},
	}

	// Theme questions and answers
	themeQuestions := map[string][]struct {
		Text   string
		Answer string
	}{
		"Europe": {
			{"What is the capital of France?", "Paris"},
			{"Which European country has the largest population?", "Germany"},
			{"What is the longest river in Europe?", "Volga"},
		},
		"Asia": {
			{"What is the capital of Japan?", "Tokyo"},
			{"Which Asian country has the largest population?", "China"},
			{"What is the highest mountain in Asia?", "Mount Everest"},
		},
		"Africa": {
			{"What is the capital of Egypt?", "Cairo"},
			{"Which African country has the largest population?", "Nigeria"},
			{"What is the largest desert in Africa?", "Sahara"},
		},
		"Americas": {
			{"What is the capital of Brazil?", "Brasilia"},
			{"Which American country has the largest population?", "United States"},
			{"What is the longest river in South America?", "Amazon"},
		},
		"Physics": {
			{"What is the SI unit of force?", "Newton"},
			{"What is the speed of light in meters per second?", "299,792,458"},
			{"What is the formula for kinetic energy?", "1/2 mv²"},
		},
		"Chemistry": {
			{"What is the chemical symbol for gold?", "Au"},
			{"What is the pH of pure water?", "7"},
			{"What is the chemical formula for water?", "H2O"},
		},
		"Biology": {
			{"What is the powerhouse of the cell?", "Mitochondria"},
			{"What is the process by which plants make food?", "Photosynthesis"},
			{"What is the largest organ in the human body?", "Skin"},
		},
		"Astronomy": {
			{"What is the closest planet to the Sun?", "Mercury"},
			{"What is the largest planet in our solar system?", "Jupiter"},
			{"What is the name of our galaxy?", "Milky Way"},
		},
		"Action": {
			{"Who played James Bond in 'Casino Royale'?", "Daniel Craig"},
			{"What is the highest-grossing action movie of all time?", "Avengers: Endgame"},
			{"Who directed 'The Matrix'?", "Wachowski Sisters"},
		},
		"Comedy": {
			{"Who starred in 'The Hangover'?", "Bradley Cooper"},
			{"What is the highest-grossing comedy movie?", "Minions"},
			{"Who created 'The Office'?", "Ricky Gervais"},
		},
		"Rock": {
			{"Who is known as the 'King of Rock and Roll'?", "Elvis Presley"},
			{"Which band released 'Stairway to Heaven'?", "Led Zeppelin"},
			{"Who was the lead singer of Queen?", "Freddie Mercury"},
		},
		"Pop": {
			{"Who is known as the 'Queen of Pop'?", "Madonna"},
			{"Which artist has the most Grammy wins?", "Beyoncé"},
			{"Who released 'Thriller'?", "Michael Jackson"},
		},
		"Ancient": {
			{"Who was the first Roman Emperor?", "Augustus"},
			{"What was the capital of the Byzantine Empire?", "Constantinople"},
			{"Who built the Great Wall of China?", "Qin Shi Huang"},
		},
		"Medieval": {
			{"When did the Black Death occur?", "1347-1351"},
			{"Who was the first King of England?", "Athelstan"},
			{"What was the Magna Carta signed?", "1215"},
		},
		"Football": {
			{"Which country won the first World Cup?", "Uruguay"},
			{"Who has won the most World Cups?", "Brazil"},
			{"Which player has scored the most World Cup goals?", "Miroslav Klose"},
		},
		"Basketball": {
			{"Who has won the most NBA championships?", "Bill Russell"},
			{"Which team has won the most NBA titles?", "Boston Celtics"},
			{"Who is the NBA's all-time leading scorer?", "LeBron James"},
		},
		"Novels": {
			{"Who wrote 'Pride and Prejudice'?", "Jane Austen"},
			{"What is the longest novel ever written?", "In Search of Lost Time"},
			{"Who wrote 'War and Peace'?", "Leo Tolstoy"},
		},
		"Poetry": {
			{"Who wrote 'The Raven'?", "Edgar Allan Poe"},
			{"Who wrote 'The Waste Land'?", "T.S. Eliot"},
			{"Who wrote 'Paradise Lost'?", "John Milton"},
		},
		"Computers": {
			{"Who created the first computer?", "Charles Babbage"},
			{"What was the first personal computer?", "Altair 8800"},
			{"Who founded Microsoft?", "Bill Gates"},
		},
		"Internet": {
			{"When was the World Wide Web invented?", "1989"},
			{"Who created the first web browser?", "Tim Berners-Lee"},
			{"What was the first social media platform?", "Six Degrees"},
		},
		"Cuisine": {
			{"What is the national dish of Italy?", "Pizza"},
			{"What is the most expensive spice in the world?", "Saffron"},
			{"What is the national dish of Japan?", "Sushi"},
		},
		"Drinks": {
			{"What is the most consumed beverage in the world?", "Tea"},
			{"What is the oldest known alcoholic beverage?", "Mead"},
			{"What is the most expensive coffee in the world?", "Kopi Luwak"},
		},
		"Planets": {
			{"How many planets are in our solar system?", "8"},
			{"Which planet has the most moons?", "Saturn"},
			{"What is the hottest planet in our solar system?", "Venus"},
		},
		"Stars": {
			{"What is the closest star to Earth?", "Sun"},
			{"What is the brightest star in the night sky?", "Sirius"},
			{"What is the largest known star?", "UY Scuti"},
		},
		"Greek": {
			{"Who is the king of the Greek gods?", "Zeus"},
			{"Who is the god of war?", "Ares"},
			{"Who is the god of the sea?", "Poseidon"},
		},
		"Norse": {
			{"Who is the king of the Norse gods?", "Odin"},
			{"Who is the god of thunder?", "Thor"},
			{"What is the name of Odin's eight-legged horse?", "Sleipnir"},
		},
		"Mammals": {
			{"What is the largest mammal?", "Blue Whale"},
			{"What is the fastest land mammal?", "Cheetah"},
			{"What is the smallest mammal?", "Bumblebee Bat"},
		},
		"Birds": {
			{"What is the largest bird?", "Ostrich"},
			{"What is the fastest bird?", "Peregrine Falcon"},
			{"What is the smallest bird?", "Bee Hummingbird"},
		},
		"English": {
			{"What is the most common letter in English?", "E"},
			{"What is the longest word in English?", "Pneumonoultramicroscopicsilicovolcanoconiosis"},
			{"What is the shortest complete sentence in English?", "I am"},
		},
		"Spanish": {
			{"What is the most common letter in Spanish?", "E"},
			{"What is the longest word in Spanish?", "Esternocleidomastoideo"},
			{"What is the shortest complete sentence in Spanish?", "Yo soy"},
		},
		"Presidents": {
			{"Who was the first President of the United States?", "George Washington"},
			{"Who was the youngest President?", "Theodore Roosevelt"},
			{"Who was the oldest President?", "Joe Biden"},
		},
		"Companies": {
			{"What is the most valuable company in the world?", "Apple"},
			{"What was the first company to reach $1 trillion?", "Apple"},
			{"What is the oldest company still operating?", "Kongo Gumi"},
		},
	}

	gameNames := []string{
		"World Capitals Challenge", "Science Explorer", "Movie Mania", "Music Legends", "History Buffs",
		"Sports Fanatics", "Literature Quiz", "Art & Artists", "Technology Trivia", "Geography Genius",
		"Food & Drink", "Nature Wonders", "Space Odyssey", "Mythology Quest", "Famous Inventions",
		"Animal Kingdom", "Language Lovers", "Political Leaders", "Business Brains", "Fashion Forward",
		"TV Showdown", "Video Game Vault", "Math Masters", "Medical Marvels", "Travel Trivia",
		"Pop Culture", "Classic Cars", "Olympic Heroes", "Internet Icons", "Board Game Bonanza",
	}
	gameDescs := []string{
		"Test your knowledge of world capitals!", "Explore the wonders of science.", "How well do you know movies?", "Quiz on music legends and hits.", "History from ancient to modern times.",
		"All about sports and athletes.", "Literary classics and authors.", "Famous works and artists.", "Tech breakthroughs and gadgets.", "Geography from mountains to rivers.",
		"Culinary facts and famous dishes.", "Natural wonders and wildlife.", "Space, planets, and astronomy.", "Gods, myths, and legends.", "Inventions that changed the world.",
		"Animals from A to Z.", "Languages and linguistics.", "World leaders and politics.", "Business, brands, and tycoons.", "Fashion through the ages.",
		"TV shows and characters.", "Video game history and trivia.", "Math puzzles and logic.", "Medical science and discoveries.", "Travel destinations and facts.",
		"Pop culture moments.", "Classic and modern cars.", "Olympic history and athletes.", "Internet and meme culture.", "Board games old and new.",
	}

	themeSets := [][]string{
		{"Europe", "Asia", "Africa", "Americas"},
		{"Physics", "Chemistry", "Biology", "Astronomy"},
		{"Action", "Comedy", "Drama", "Animation"},
		{"Rock", "Pop", "Jazz", "Classical"},
		{"Ancient", "Medieval", "Modern", "Contemporary"},
		{"Football", "Basketball", "Tennis", "Olympics"},
		{"Novels", "Poetry", "Plays", "Short Stories"},
		{"Painters", "Sculptors", "Photographers", "Architects"},
		{"Computers", "Internet", "Mobile", "AI"},
		{"Mountains", "Rivers", "Deserts", "Islands"},
		{"Cuisine", "Drinks", "Desserts", "Spices"},
		{"Forests", "Oceans", "Deserts", "Mountains"},
		{"Planets", "Stars", "Missions", "Astronauts"},
		{"Greek", "Norse", "Egyptian", "Roman"},
		{"Transport", "Communication", "Energy", "Medicine"},
		{"Mammals", "Birds", "Reptiles", "Fish"},
		{"English", "Spanish", "Chinese", "Arabic"},
		{"Presidents", "Prime Ministers", "Monarchs", "Revolutionaries"},
		{"Companies", "Entrepreneurs", "Brands", "Startups"},
		{"Designers", "Models", "Trends", "Accessories"},
		{"Sitcoms", "Dramas", "Reality", "Cartoons"},
		{"Arcade", "RPG", "Strategy", "Sports"},
		{"Algebra", "Geometry", "Calculus", "Logic"},
		{"Diseases", "Treatments", "Discoveries", "Pioneers"},
		{"Cities", "Landmarks", "Cultures", "Languages"},
		{"Celebrities", "Events", "Trends", "Media"},
		{"Vintage", "Sports Cars", "Luxury", "Electric"},
		{"Athletes", "Events", "Records", "Nations"},
		{"Websites", "Memes", "Influencers", "Platforms"},
		{"Classics", "Strategy", "Party", "Family"},
	}

	for i := 0; i < 30; i++ {
		gameID := uuid.NewString()
		var rounds []types.RoundClient
		numRounds := 2 + i%3 // 2-4 rounds
		for r := 0; r < numRounds; r++ {
			roundID := uuid.NewString()
			timeOpt := timeOptions[r%len(timeOptions)]
			var ranks []types.RoundRankClient
			for _, ro := range rankOptions {
				ranks = append(ranks, types.RoundRankClient{
					Id:         ro.Points,
					Label:      ro.Label,
					IsSelected: true,
				})
			}
			themes := []types.ThemeClient{}
			themeSet := themeSets[i%len(themeSets)]
			for _, themeName := range themeSet {
				themeID := uuid.NewString()
				questions := []types.QuestionClient{}
				if themeQs, ok := themeQuestions[themeName]; ok {
					for q, qa := range themeQs {
						questionID := uuid.NewString()
						points := rankOptions[q%len(rankOptions)].Points
						questions = append(questions, types.QuestionClient{
							Id:         questionID,
							Text:       qa.Text,
							Answer:     qa.Answer,
							Points:     points,
							AnsweredBy: map[string]types.AnsweredByClient{},
						})
					}
				} else {
					// Fallback questions if theme not found
					for q := 0; q < 3; q++ {
						questionID := uuid.NewString()
						points := rankOptions[q%len(rankOptions)].Points
						questions = append(questions, types.QuestionClient{
							Id:         questionID,
							Text:       themeName + " Question " + string(q+1+48),
							Answer:     "Answer " + string(q+1+48),
							Points:     points,
							AnsweredBy: map[string]types.AnsweredByClient{},
						})
					}
				}
				themes = append(themes, types.ThemeClient{
					Id:        themeID,
					Name:      themeName,
					Questions: questions,
				})
			}
			rounds = append(rounds, types.RoundClient{
				Id:    roundID,
				Name:  "Round " + string(r+1+48),
				Ranks: ranks,
				Time: types.RoundTimeClient{
					Id:         timeOpt.Seconds,
					Label:      timeOpt.Label,
					IsSelected: true,
				},
				Themes: themes,
			})
		}
		templates = append(templates, types.GameTemplateClient{
			ID:          gameID,
			Name:        gameNames[i%len(gameNames)],
			Description: gameDescs[i%len(gameDescs)],
			IsPublic:    true,
			Rounds:      rounds,
			CreatorID:   creatorID,
		})
	}
	return templates
}

// GenerateGameTemplateRequest returns a sample GameTemplateClient object that can be used as a request body
func GenerateGameTemplateRequest(creatorID string) types.GameTemplateClient {
	gameID := uuid.NewString()
	roundID := uuid.NewString()
	themeID := uuid.NewString()

	// Create rank options
	ranks := []types.RoundRankClient{
		{Id: 100, Label: "Easy", IsSelected: true},
		{Id: 200, Label: "Medium", IsSelected: true},
		{Id: 300, Label: "Hard", IsSelected: true},
		{Id: 400, Label: "Expert", IsSelected: true},
		{Id: 500, Label: "Master", IsSelected: true},
	}

	// Create time settings
	timeSettings := types.RoundTimeClient{
		Id:         30,
		Label:      "30 seconds",
		IsSelected: true,
	}

	// Create questions
	questions := []types.QuestionClient{
		{
			Id:         uuid.NewString(),
			Text:       "What is the capital of France?",
			Answer:     "Paris",
			Points:     100,
			AnsweredBy: map[string]types.AnsweredByClient{},
		},
		{
			Id:         uuid.NewString(),
			Text:       "Which European country has the largest population?",
			Answer:     "Germany",
			Points:     200,
			AnsweredBy: map[string]types.AnsweredByClient{},
		},
		{
			Id:         uuid.NewString(),
			Text:       "What is the longest river in Europe?",
			Answer:     "Volga",
			Points:     300,
			AnsweredBy: map[string]types.AnsweredByClient{},
		},
	}

	// Create theme
	theme := types.ThemeClient{
		Id:        themeID,
		Name:      "Europe",
		Questions: questions,
	}

	// Create round
	round := types.RoundClient{
		Id:     roundID,
		Name:   "Round 1",
		Ranks:  ranks,
		Time:   timeSettings,
		Themes: []types.ThemeClient{theme},
	}

	// Create game template
	return types.GameTemplateClient{
		ID:          gameID,
		Name:        "World Capitals Challenge",
		Description: "Test your knowledge of world capitals!",
		IsPublic:    true,
		Rounds:      []types.RoundClient{round},
		CreatorID:   creatorID,
	}
}

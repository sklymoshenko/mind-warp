-- +goose Up
-- +goose StatementBegin
-- 0001_initial_schema.sql
-- Comprehensive initial schema for Trivia Game and Templates

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email),
  UNIQUE(name)
);

-- Game Templates (prototypes)
CREATE TABLE game_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Template Rounds
CREATE TABLE template_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_template_id UUID NOT NULL REFERENCES game_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time_settings JSONB,
  rank_settings JSONB,
  position INT NOT NULL
);

-- Template Themes
CREATE TABLE template_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES template_rounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL
);

-- Template Questions
CREATE TABLE template_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id UUID NOT NULL REFERENCES template_themes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  answer TEXT NOT NULL,
  points INT NOT NULL,
  position INT NOT NULL
);

-- Live Games
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,            -- game name
  creator_id UUID NOT NULL REFERENCES users(id),
  template_id UUID REFERENCES game_templates(id),
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  winner_id UUID REFERENCES users(id),
  finish_date TIMESTAMPTZ,
  current_round_id UUID,
  current_question_id UUID,
  current_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live Rounds
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time_settings JSONB,
  rank_settings JSONB,
  position INT NOT NULL
);

-- Live Themes
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL
);

-- Live Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  answer TEXT NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Game Participants & Scores
CREATE TABLE game_users (
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  round_scores JSONB NOT NULL DEFAULT '{}'::JSONB,
  PRIMARY KEY (game_id, user_id)
);

-- Game Invites
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE game_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status invite_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Answers
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_correct BOOLEAN,
  time_answered INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Indexes
CREATE INDEX idx_games_finished ON games(is_finished);
CREATE INDEX idx_templates_public ON game_templates(is_public);
CREATE INDEX idx_template_rounds_template ON template_rounds(game_template_id);
CREATE INDEX idx_rounds_game ON rounds(game_id);
CREATE INDEX idx_questions_theme ON questions(theme_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_game_invites_status ON game_invites(status);

-- Full-text search indexes on names (use 'simple' config for multi-language or no-stemming)
CREATE INDEX idx_games_name_fts ON games USING GIN (to_tsvector('simple', name));
CREATE INDEX idx_templates_name_fts ON game_templates USING GIN (to_tsvector('simple', name));

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop Full-text search indexes
DROP INDEX IF EXISTS idx_templates_name_fts;
DROP INDEX IF EXISTS idx_games_name_fts;


-- Drop other indexes
DROP INDEX IF EXISTS idx_answers_question;
DROP INDEX IF EXISTS idx_questions_theme;
DROP INDEX IF EXISTS idx_rounds_game;
DROP INDEX IF EXISTS idx_template_rounds_template;
DROP INDEX IF EXISTS idx_templates_public;
DROP INDEX IF EXISTS idx_games_finished;
DROP INDEX IF EXISTS idx_game_invites_status;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS game_invites;
DROP TABLE IF EXISTS game_users;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS games;

DROP TABLE IF EXISTS template_questions;
DROP TABLE IF EXISTS template_themes;
DROP TABLE IF EXISTS template_rounds;
DROP TABLE IF EXISTS game_templates;

DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";

-- Drop invite status type
DROP TYPE IF EXISTS invite_status;

-- +goose StatementEnd

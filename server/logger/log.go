package logger

import (
	"fmt"
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gopkg.in/natefinch/lumberjack.v2"
)

func init() {
	// timestamp format
	zerolog.TimeFieldFormat = time.RFC3339

	// console output
	consoleWriter := zerolog.NewConsoleWriter(func(w *zerolog.ConsoleWriter) {
		w.Out = os.Stdout
		w.NoColor = false
		w.TimeFormat = time.RFC3339

		// Order: level, timestamp, message
		w.PartsOrder = []string{
			zerolog.LevelFieldName,
			zerolog.TimestampFieldName,
			zerolog.MessageFieldName,
		}
		// [LEVEL] in color based on level initial
		w.FormatLevel = func(i interface{}) string {
			return fmt.Sprintf("[%s]", i)
		}

		// [timestamp]
		w.FormatTimestamp = func(i interface{}) string {
			return fmt.Sprintf("[%s]", i)
		}

		// : message
		w.FormatMessage = func(i interface{}) string {
			return fmt.Sprintf(": %s", i)
		}
	})

	// rotating file output (lumberjack handles log rotation)
	fileWriter := &lumberjack.Logger{
		Filename:   "app.log",
		MaxSize:    100, // megabytes
		MaxBackups: 7,
		MaxAge:     30, // days
		Compress:   true,
	}

	// send logs to both console and file
	multi := zerolog.MultiLevelWriter(consoleWriter, fileWriter)
	log.Logger = zerolog.New(multi).
		With().
		Timestamp().
		Caller().
		Logger()
}

// Info logs an unformatted info message
func Info(msg string, v ...interface{}) {
	log.Info().Msgf(msg, v...)
}

// Infof logs a formatted info message
func Infof(format string, v ...interface{}) {
	log.Info().Msgf(format, v...)
}

// Debug logs an unformatted debug message
func Debug(msg string) {
	log.Debug().Msg(msg)
}

// Debugf logs a formatted debug message
func Debugf(format string, v ...interface{}) {
	log.Debug().Msgf(format, v...)
}

// Error logs an unformatted error message
func Error(msg string) {
	log.Error().Msg(msg)
}

// Errorf logs a formatted error message
func Errorf(format string, v ...interface{}) {
	log.Error().Msgf(format, v...)
}

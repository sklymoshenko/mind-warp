import './App.css'
import BackgroundWrapper from './components/BackgroundWrapper'
import CreateGame from './pages/CreateGame'
import WelcomePage from './pages/WelcomePage'
import { Router, Route } from '@solidjs/router'
import { Game } from './types'
import { createMemo, createSignal } from 'solid-js'
import GameDashboard from './pages/Dashboard'
import mockGame from './data/mockGame'
import GameRound from './pages/GameRound'

export default () => {
  const [game, setGame] = createSignal<Game>(mockGame)
  const currentRound = createMemo(() => {
    return game().rounds.find((r) => r.id === game().currentRound)
  })

  return (
    <BackgroundWrapper>
      <Router>
        <Route path="/" component={WelcomePage} />
        <Route path="/create-game" component={(props) => <CreateGame onGameCreated={setGame} {...props} />} />
        {game() && (
          <Route
            path="/game/:gameId"
            component={(props) => <GameDashboard onUpdateGame={setGame} game={game()!} {...props} />}
          />
        )}
        {currentRound() && (
          <Route
            path="/game/:gameid/round/:roundId"
            component={(props) => <GameRound round={currentRound()!} users={game().users} {...props} />}
          />
        )}
      </Router>
    </BackgroundWrapper>
  )
}

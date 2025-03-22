import './App.css'
import BackgroundWrapper from './components/BackgroundWrapper'
import CreateGame from './pages/CreateGame'
import WelcomePage from './pages/WelcomePage'
import { Router, Route } from '@solidjs/router'
import { Game } from './types'
import { createSignal } from 'solid-js'
import GameDashboard from './pages/Dashboard'
import mockGame from './data/mockGame'

export default () => {
  const [game, setGame] = createSignal<Game>(mockGame)
  return (
    <BackgroundWrapper>
      <Router>
        <Route path="/" component={WelcomePage} />
        <Route path="/create-game" component={(props) => <CreateGame onGameCreated={setGame} {...props} />} />
        {game() && (
          <Route
            path="/dashboard"
            component={(props) => <GameDashboard onUpdateGame={setGame} game={game()!} {...props} />}
          />
        )}
      </Router>
    </BackgroundWrapper>
  )
}

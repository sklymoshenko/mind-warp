import './App.css'
import BackgroundWrapper from './components/BackgroundWrapper'
import CreateGame from './pages/CreateGame'
import WelcomePage from './pages/WelcomePage'
import { Router, Route } from '@solidjs/router'

export default () => {
  return (
    <BackgroundWrapper>
      <Router>
        <Route path="/" component={WelcomePage} />
        <Route path="/create-game" component={CreateGame} />
      </Router>
    </BackgroundWrapper>
  )
}

import './App.css'
import BackgroundWrapper from './components/BackgroundWrapper'
import WelcomePage from './pages/WelcomePage'
import { Route, Router } from '@solidjs/router'
import Login from './pages/Login'
import Register from './pages/Register'
import { Toaster } from 'solid-toast'
import AuthGuard from './components/AuthGuard'
import { AuthProvider } from './context/AuthContext'
import Overview from './pages/Overview'
import MyGames from './pages/MyGames'
import LocalGameRoutes from './pages/LocalGame'
import RemoteGameRoutes from './pages/RemoteGameRoutes'
import HowToPlay from './pages/HowToPlay'

const Main = () => {
  return (
    <AuthProvider>
      <BackgroundWrapper>
        <Router>
          <Route path="/" component={WelcomePage} />
          <Route path="/how-to-play" component={HowToPlay} />
          <LocalGameRoutes />
          <RemoteGameRoutes />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route
            path="/dashboard"
            component={() => {
              return (
                <AuthGuard>
                  <Overview />
                </AuthGuard>
              )
            }}
          />
          <Route
            path="/games/me"
            component={() => {
              return (
                <AuthGuard>
                  <MyGames />
                </AuthGuard>
              )
            }}
          />
        </Router>

        <Toaster position="top-right" />
      </BackgroundWrapper>
    </AuthProvider>
  )
}

export default Main

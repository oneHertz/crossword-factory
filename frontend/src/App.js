import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { GlobalStateProvider} from './utils/useGlobalState'
import Login from './components/login'
import Home from './components/home'
import GridEditor from './components/gridEditor'
import GridViewer from './components/gridViewer'
import GridSolution from './components/gridSolution'
import Register from './components/register'
import PasswordReset from './components/passwordReset';
import Settings from './components/settings';
import PasswordResetConfirmation from './components/passwordResetConfirmation';
import VerifyEmail from './components/verifyEmail';

function App() {
  return (
    <GlobalStateProvider>
      <Router basename='/'>
        <Login/>
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/nouvelle-grille" element={<GridEditor/>} />
          <Route exact path="/grille/:uid" element={<GridViewer/>} />
          <Route exact path="/grille/:uid/modifier" element={<GridEditor/>} />
          <Route exact path="/grille/:uid/solution/:solutionHash" element={<GridSolution/>} />
          <Route exact path="/sign-up" element={<Register/>} />
          <Route exact path="/settings" element={<Settings/>} />
          <Route exact path="/password-reset" element={<PasswordReset/>} />
          <Route exact path="/password-reset-confirmation/:key" element={<PasswordResetConfirmation/>} />
          <Route exact path="/verify-email/" element={<VerifyEmail/>} />
          <Route exact path="/verify-email/:key" element={<VerifyEmail/>} />
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}

export default App;

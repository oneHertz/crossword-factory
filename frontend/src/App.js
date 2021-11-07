import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { GlobalStateProvider} from './utils/useGlobalState'
import Login from './components/login'
import Home from './components/home'
import GridEditor from './components/gridEditor'
import GridViewer from './components/gridViewer'
import OwnGrids from './components/ownGrids'


function App() {
  return (
    <GlobalStateProvider>
      
      <Router basename='/'>
        <Login/>
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route exact path="/nouvelle-grille" element={<GridEditor/>} />
          <Route exact path="/mes-grilles" element={<OwnGrids/>} />
          <Route exact path="/grille/:uid" element={<GridViewer/>} />
          <Route exact path="/grille/:uid/modifier" element={<GridEditor/>} />
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}

export default App;

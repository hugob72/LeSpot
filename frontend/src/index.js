import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router , Route, Switch } from 'react-router-dom'
import './index.css';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Preferences from './pages/Preferences';
import Error from './pages/Error';
import Login from './pages/Login';
import Profile from './pages/Profile';
import StyleContextProvider from './context/StyleContextProvider';
import AddArticle from './pages/AddArticle';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyleContextProvider>
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/detail/:idArticle">
            <Detail />
          </Route>
          <Route path="/preferences">
            <Preferences />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/add-article">
            <AddArticle />
          </Route>
          <Route path="*">
            <Error />
          </Route>
        </Switch>
      </Router>
    </StyleContextProvider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router , Route, Switch } from 'react-router-dom'
import './index.css';
import Home from './pages/client/Home';
import Detail from './pages/client/Detail';
import Preferences from './pages/client/Preferences';
import Error from './pages/client/Error';
import Login from './pages/client/Login';
import Profile from './pages/client/Profile';
import StyleContextProvider from './context/StyleContextProvider';
import AddArticle from './pages/client/AddArticle';
import HomeAdmin from './pages/admin/HomeAdmin';

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
          <Route path="/admin/dashboard">
            <HomeAdmin />
          </Route>
          <Route path="*">
            <Error />
          </Route>
        </Switch>
      </Router>
    </StyleContextProvider>
  </React.StrictMode>
);

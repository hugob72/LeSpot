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
import { CartContextProvider } from './context/CartContext';
import AddArticle from './pages/client/AddArticle';
import HomeAdmin from './pages/admin/HomeAdmin';
import CartSummary from './pages/client/CartSummary';
import Checkout from './pages/client/Checkout';
import MyOrders from './pages/client/MyOrders';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartContextProvider>
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
            <Route path="/cart">
              <CartSummary />
            </Route>
            <Route path="/checkout">
              <Checkout />
            </Route>
            <Route path="/orders">
              <MyOrders />
            </Route>
            <Route path="/add-article">
              <AddArticle />
            </Route>
            <Route path="/admin">
              <HomeAdmin />
            </Route>
            <Route path="*">
              <Error />
            </Route>
          </Switch>
        </Router>
      </StyleContextProvider>
    </CartContextProvider>
  </React.StrictMode>
);

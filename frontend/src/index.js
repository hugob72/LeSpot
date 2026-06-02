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
import PreferencesContextProvider from './context/PreferencesContextProvider';
import { CartContextProvider } from './context/CartContext';
import AddArticle from './pages/client/AddArticle';
import HomeAdmin from './pages/admin/HomeAdmin';
import CartSummary from './pages/client/CartSummary';
import Checkout from './pages/client/Checkout';
import MyOrders from './pages/client/MyOrders';
import CreateComplaint from './pages/client/CreateComplaint';
import MyComplaints from './pages/client/MyComplaints';
import ComplaintDetail from './pages/client/ComplaintDetail';
import Service from './pages/client/Service';
import ServiceDetail from './pages/client/ServiceDetail';
import MyBookings from './pages/client/MyBookings';
import Promotions from './pages/client/Promotions';
import MyFavorites from './pages/client/MyFavorite';
import MyReviews from './pages/client/MyReviews';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartContextProvider>
      <PreferencesContextProvider>
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/services">
              <Service />
            </Route>
            <Route path="/service/:id">
              <ServiceDetail />
            </Route>
            <Route path="/bookings">
              <MyBookings />
            </Route>
            <Route path="/detail/:idArticle">
              <Detail />
            </Route>
            <Route path="/promotions">
                <Promotions />
            </Route>
            <Route path="/favoris">
                <MyFavorites />
            </Route>
            <Route path="/reviews">
                <MyReviews />
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
            <Route path="/create-complaint">
              <CreateComplaint />
            </Route>
            <Route path="/complaints">
              <MyComplaints />
            </Route>
            <Route path="/complaint/:id">
              <ComplaintDetail />
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
      </PreferencesContextProvider>
    </CartContextProvider>
  </React.StrictMode>
);

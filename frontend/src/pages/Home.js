import Header from '../components/Header';
import ShoppingList from '../components/ShoppingList';
import Cart from '../components/Cart';
import Footer from '../components/Footer';
import {useState} from 'react';
import '../styles/home.css';

function Home() {
  const [cartItems, setCartItems] = useState([]);
  return (
    <div className="home">
      
      <Header />
      <div className="container">
        <div className="article-container">
          <ShoppingList cartItems={cartItems} setCartItems={setCartItems} />
        </div>
        <div className="cart-container">
          <Cart cartItems={cartItems} setCartItems={setCartItems} />
        </div>
      </div>
      
      <Footer />

    </div>
  );
}

export default Home;

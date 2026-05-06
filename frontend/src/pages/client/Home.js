import Header from '../../components/client/Header';
import ShoppingList from '../../components/client/ShoppingList';
import Cart from '../../components/client/Cart';
import Footer from '../../components/client/Footer';
import {useState} from 'react';
import '../../styles/home.css';

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

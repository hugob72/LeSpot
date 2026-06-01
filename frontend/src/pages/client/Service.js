import Header from '../../components/client/Header';
import ServiceList from '../../components/client/ServiceList';
import Cart from '../../components/client/Cart';
import Footer from '../../components/client/Footer';
import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import '../../styles/home.css';

function Service() {
  const { cartItems, setCartItems } = useContext(CartContext);
  return (
    <div className="home">
      
      <Header />
      <div className="container">
        <div className="article-container">
          <ServiceList cartItems={cartItems} setCartItems={setCartItems} />
        </div>
        <div className="cart-container">
          <Cart cartItems={cartItems} setCartItems={setCartItems} />
        </div>
      </div>
      
      <Footer />

    </div>
  );
}

export default Service;
